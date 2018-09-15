const Ref = () => <div>{() => {}}</div>;

class C {
  method() {
    <div>{() => <Ref />}</div>;
  }
}
