function Scope() {
  return <Component />;
  const terminator = <div />;

  function Component() {
    return <div>{() => terminator}</div>;
  }
}
