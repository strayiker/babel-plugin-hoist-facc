class C {
  method() {
    <div>{() => <Ref />}</div>;
  }
}

const Ref = () => <div>{() => {}}</div>;
