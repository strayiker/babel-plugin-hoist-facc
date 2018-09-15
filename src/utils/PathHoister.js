import { types as t } from '@babel/core';
import referenceVisitor from './referenceVisitor';
import iterateTree from './iterateTree';

export default class PathHoister {
  constructor(path) {
    this.reset(path);
  }

  reset = path => {
    // Storage for scopes we can't hoist.
    this.breakOn = [];
    // Storage for bindings that may affect what path we can hoist to.
    this.bindings = {};
    // Storage for eligible scopes.
    this.scopes = [];
    // Our original path.
    this.path = path;
    // By default, we attach as far up as we can; but if we're trying
    // to avoid referencing a binding, we may have to go after.
    this.attachAfter = false;
  };

  // A scope is compatible if all required bindings are reachable.
  isCompatibleScope = scope =>
    !this.breakOn.includes(scope) &&
    !Object.keys(this.bindings).some(
      key => !scope.bindingIdentifierEquals(key, this.bindings[key].identifier),
    );

  // Look through all scopes and push compatible ones.
  setCompatibleScopes = () =>
    iterateTree(this.path.scope, 'parent', scope => {
      if (this.isCompatibleScope(scope)) {
        // deopt: should ignore this scope since it's ourselves
        if (scope !== this.path.scope) {
          this.scopes.push(scope);
        }
        // Continue
        return false;
      }
      // Stop
      return true;
    });

  getAttachmentPath = () => {
    const path = this.getScopeAttachmentPath();
    return this.ajustAttachmentPath(path);
  };

  getScopeAttachmentPath() {
    const scope = this.scopes.pop();
    // deopt: no compatible scopes
    if (!scope) {
      return null;
    }

    if (scope.path.isProgram()) {
      return this.getNextScopeAttachmentParent();
    }

    if (scope.path.isFunction()) {
      if (this.hasOwnParamBindings(scope)) {
        // Needs to be attached to the body
        const bodies = scope.path.get('body').get('body');
        // Don't attach to something that's going to get hoisted,
        // like a default parameter
        // eslint-disable-next-line no-underscore-dangle
        return bodies.find(b => !b.node._blockHoist);
        // deopt: If here, no attachment path found
      }
      // Doesn't need to be be attached to this scope
      return this.getNextScopeAttachmentParent();
    }

    return null;
  }

  ajustAttachmentPath = prevPath => {
    if (!prevPath) {
      return null;
    }

    let { scope } = prevPath;
    let path = prevPath;

    // Don't allow paths that have their own lexical environments to pollute
    if (scope.path === path) {
      scope = path.scope.parent;
    }

    if (!scope.path.isProgram() && !scope.path.isFunction()) {
      return path;
    }

    Object.entries(this.bindings).forEach(([name, binding]) => {
      // Check binding is a direct child of this paths scope
      if (!scope.hasOwnBinding(name)) {
        return;
      }

      // allow parameter references and expressions in params (like destructuring rest)
      if (binding.kind === 'param' || binding.path.parentKey === 'params') {
        return;
      }

      // For each binding, get its attachment parent.
      // This gives us an idea of where we might introduce conflicts.
      const bindingParentPath = this.getAttachmentParentForPath(binding.path);

      // If the binding's attachment appears at or after our attachment point, then we move after it.
      if (bindingParentPath.key >= path.key) {
        this.attachAfter = true;
        // eslint-disable-next-line prefer-destructuring
        path = binding.path;

        // We also move past any constant violations.
        binding.constantViolations.forEach(violationPath => {
          if (this.getAttachmentParentForPath(violationPath).key > path.key) {
            path = violationPath;
          }
        });
      }
    });

    return path;
  };

  getNextScopeAttachmentParent = () => {
    const scope = this.scopes.pop();

    if (!scope) {
      return null;
    }

    return this.getAttachmentParentForPath(scope.path);
  };

  // Find an attachment for this path.
  getAttachmentParentForPath = path => {
    const cond = p =>
      !p.parentPath || (Array.isArray(p.container) && p.isStatement());

    return iterateTree(path, 'parentPath', cond);
  };

  // Returns true if a scope has param bindings.
  hasOwnParamBindings = scope =>
    Object.entries(this.bindings).some(([name, binding]) => {
      if (!scope.hasOwnBinding(name)) {
        return false;
      }
      // Ensure constant; without it we could place behind a reassignment
      return binding.kind === 'param' && binding.constant;
    });

  run() {
    this.path.traverse(referenceVisitor, this);
    this.setCompatibleScopes();

    const attachTo = this.getAttachmentPath();

    if (!attachTo) {
      return null;
    }

    // Don't bother hoisting to the same function as this will cause multiple branches to be
    // evaluated more than once leading to a bad optimisation
    if (attachTo.getFunctionParent() === this.path.getFunctionParent()) {
      return null;
    }

    // Generate declaration and insert it to our point
    let uid = attachTo.scope.generateUidIdentifier('ref');

    const declarator = t.variableDeclarator(uid, this.path.node);

    const insertFn = this.attachAfter ? 'insertAfter' : 'insertBefore';
    const [attached] = attachTo[insertFn]([
      attachTo.isVariableDeclarator()
        ? declarator
        : t.variableDeclaration('var', [declarator]),
    ]);

    const parent = this.path.parentPath;

    if (parent.isJSXElement() && this.path.container === parent.node.children) {
      // Turning the `span` in `<div><span /></div>` to an expression so we need to wrap it with
      // an expression container
      uid = t.JSXExpressionContainer(uid);
    }

    this.path.replaceWith(t.cloneNode(uid));

    return attachTo.isVariableDeclarator()
      ? attached.get('init')
      : attached.get('declarations.0.init');
  }
}
