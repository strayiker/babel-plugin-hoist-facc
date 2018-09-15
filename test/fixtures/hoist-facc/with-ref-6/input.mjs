function fn(props) {
  function fn1() {
    <div>{() => <div {...props} />}</div>;
  }
}
