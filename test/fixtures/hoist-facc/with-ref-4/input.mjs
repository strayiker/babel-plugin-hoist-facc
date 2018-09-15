function fn(prop) {
  function fn1() {
    <div>
      {() => {
        prop += 1;
      }}
    </div>;
  }
}
