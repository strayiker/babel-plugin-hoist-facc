import { types as t } from '@babel/core';
import referenceVisitor from './referenceVisitor';
import iterateTree from './iterateTree';

const insertAfter = (path, node) => path.insertAfter(node);
const insertBefore = (path, node) => path.insertBefore(node);
const pushContainer = (path, node) => path.pushContainer('body', node);

export default class PathHoister {
  constructor({ loose, unsafeHoistInClass }) {
    this.loose = loose;
    this.unsafeHoistInClass = unsafeHoistInClass;
  }

  reset = path => {
    // Our original path.
    this.path = path;
    // Storage for bindings that may affect what path we can hoist to.
    this.bindings = {};
    // Storage for eligible scopes.
    this.scopes = [];
    // Storage for scopes we can't hoist.
    this.breakOn = [];
    // Attach as member expression to "this" if in class scope
    this.attachToThis = false;
    // By default, we attach as far up as we can; but if we're trying
    // to avoid referencing a binding, we may have to go after.
    this.insertFn = insertBefore;
  };

  // A scope is compatible if all required bindings are reachable.
  isCompatibleScope = scope =>
    !this.breakOn.includes(scope) &&
    !Object.keys(this.bindings).some(
      key => !scope.bindingIdentifierEquals(key, this.bindings[key].identifier),
    );

  // Look through all scopes and push compatible ones.
  setCompatibleScopes = path =>
    iterateTree(path.scope, 'parent', scope => {
      if (this.isCompatibleScope(scope)) {
        // deopt: should ignore this scope since it's ourselves
        if (scope !== path.scope) {
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

    const { path } = scope;

    if (path.isProgram()) {
      return this.getNextScopeAttachmentParent();
    }

    if (path.isClassDeclaration()) {
      this.insertFn = pushContainer;
      this.attachToThis = true;

      const isDerived = !!path.node.superClass;

      const body = path.get('body');
      const bodies = body.get('body');

      let constructor = bodies.find(b =>
        b.isClassMethod({ kind: 'constructor' }),
      );

      if (!constructor) {
        const newConstructor = t.classMethod(
          'constructor',
          t.identifier('constructor'),
          [],
          t.blockStatement([]),
        );

        if (isDerived) {
          newConstructor.params = [t.restElement(t.identifier('args'))];
          newConstructor.body.body.push(
            t.expressionStatement(
              t.callExpression(t.super(), [
                t.spreadElement(t.identifier('args')),
              ]),
            ),
          );
        }

        [constructor] = body.unshiftContainer('body', newConstructor);
      }

      return constructor.get('body');
    }

    if (path.isFunction()) {
      // Needs to be attached to the body
      const bodies = path.get('body').get('body');
      // Don't attach to something that's going to get hoisted,
      // like a default parameter
      // eslint-disable-next-line no-underscore-dangle
      return bodies.find(b => b.node && !b.node._blockHoist);
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

    if (scope.path.isClassDeclaration()) {
      // return this.getClassConstructorPath(path);
      return path;
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
        this.insertFn = insertAfter;
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

    // We shouldn't hoist into unreachable code (https://github.com/babel/babel/issues/6751)
    const checkReachPath = path.isVariableDeclarator() ? path.parentPath : path;
    for (let i = 0; i < checkReachPath.key; i += 1) {
      const sibling = checkReachPath.getSibling(i);

      if (sibling.isReturnStatement()) {
        return null;
      }
    }

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

  buildClassPropertySpec = (ref, key, path, state) =>
    t.expressionStatement(
      t.callExpression(state.addHelper('defineProperty'), [
        ref,
        t.stringLiteral(key.name),
        path.node,
      ]),
    );

  buildClassPropertyLoose = (ref, key, path) =>
    t.expressionStatement(
      t.assignmentExpression('=', t.memberExpression(ref, key), path.node),
    );

  run(path, state) {
    this.reset(path);
    path.traverse(referenceVisitor, this);
    this.setCompatibleScopes(path);

    const attachTo = this.getAttachmentPath();

    if (!attachTo) {
      return null;
    }

    // Don't bother hoisting to the same function as this will cause multiple branches to be
    // evaluated more than once leading to a bad optimisation
    if (attachTo.getFunctionParent() === path.getFunctionParent()) {
      return null;
    }

    // Generate declaration and insert it to our point
    let toAttach;
    let uid = attachTo.scope.generateUidIdentifier('ref');

    if (this.attachToThis) {
      const buildClassProperty = this.loose
        ? this.buildClassPropertyLoose
        : this.buildClassPropertySpec;

      toAttach = buildClassProperty(t.thisExpression(), uid, path, state);
    } else {
      const declarator = t.variableDeclarator(uid, path.node);
      toAttach = attachTo.isVariableDeclarator()
        ? declarator
        : t.variableDeclaration('var', [declarator]);
    }

    const [attached] = this.insertFn(attachTo, toAttach);

    if (this.attachToThis) {
      uid = t.memberExpression(t.thisExpression(), uid);
    }

    const parent = path.parentPath;

    if (parent.isJSXElement() && path.container === parent.node.children) {
      // Turning the `span` in `<div><span /></div>` to an expression so we need to wrap it with
      // an expression container
      uid = t.JSXExpressionContainer(uid);
    }

    path.replaceWith(t.cloneNode(uid));

    if (this.attachToThis) {
      return attached;
    }

    return attachTo.isVariableDeclarator()
      ? attached.get('init')
      : attached.get('declarations.0.init');
  }
}
