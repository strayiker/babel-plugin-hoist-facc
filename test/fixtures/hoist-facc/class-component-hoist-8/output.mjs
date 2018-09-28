export default class Component extends React.Component {
  constructor(...args) {
    super(args);
    this.state = {
      text: 'test'
    };

    this._ref = () => <span>{this.state.text}</span>;
  }

  render() {
    return <div>{this._ref}</div>;
  }

}
