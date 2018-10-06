export default ({ path }) =>
  path.isFunction() && !path.isArrowFunctionExpression();
