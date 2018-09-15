import { types as t } from '@babel/core';
import iterateTree from './iterateTree';
import isReferenced from './isReferenced';

export default {
  enter(path) {
    if (!isReferenced(path)) {
      return;
    }

    // Don't hoist regular JSX identifiers ('div', 'span', etc).
    // We do have to consider member expressions for hoisting (e.g. `this.component`)
    if (
      path.isJSXIdentifier() &&
      t.react.isCompatTag(path.node.name) &&
      !path.parentPath.isJSXMemberExpression()
    ) {
      return;
    }

    // If the identifier refers to `this`,
    // we need to disallow to hoist higher than the closest, non-arrow functional scope.
    if (path.isThisExpression() || path.node.name === 'this') {
      const isNonArrowFn = ({ path }) =>
        path.isFunction() && !path.isArrowFunctionExpression();
      const fnScope = iterateTree(path.scope, 'parent', isNonArrowFn);

      if (fnScope && fnScope.parent) {
        this.breakOn.push(fnScope.parent);
      }
    }

    // Direct references that we need to track to hoist this to the highest scope we can
    const binding = path.scope.getBinding(path.node.name);

    if (!binding) {
      return;
    }

    // This binding isn't accessible from the parent scope so we can safely ignore it
    // eg. it's in a closure etc
    if (binding !== this.path.scope.parent.getBinding(path.node.name)) {
      return;
    }

    this.bindings[path.node.name] = binding;
  },
};
