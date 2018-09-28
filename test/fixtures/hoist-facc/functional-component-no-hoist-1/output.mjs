export default (({
  outer
}) => <div>{() => <span>{outer}</span>}</div>);
