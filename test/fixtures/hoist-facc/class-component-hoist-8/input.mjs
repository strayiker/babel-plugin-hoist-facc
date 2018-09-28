export default class Component extends React.Component {
  constructor(...args) {
    super(args);

    this.state = { text: 'test' };
  }

  render() {
    return <div>{() => <span>{this.state.text}</span>}</div>;
  }
}
