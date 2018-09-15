function fn(prop) {
  function fn1() {
    <div>{() => <div id={prop} />}</div>;
  }
}
