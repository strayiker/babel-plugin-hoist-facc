const GLOBAL = 0;

function fn() {
  <div>{() => GLOBAL}</div>;
}
