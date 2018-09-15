export default path => {
  if (!path.isArrowFunctionExpression() && !path.isFunctionExpression()) {
    return false;
  }

  const parent = path.parentPath;

  return (
    parent &&
    parent.isJSXExpressionContainer() &&
    parent.parentKey === 'children'
  );
};
