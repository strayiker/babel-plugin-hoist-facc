export default class Component extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleClick = () => {};

    this._ref = () => <span onClick={this.handleClick} />;
  }

  render() {
    return <div>{this._ref}</div>;
  }

}
