import { types as t } from '@babel/core';

export default ({ node, parent }) => {
  // Dirty fix for https://github.com/babel/babel/issues/8686
  if (parent.type === 'AssignmentExpression') {
    return parent.left === node || parent.right === node;
  }

  return t.isReferenced(node, parent);
};
