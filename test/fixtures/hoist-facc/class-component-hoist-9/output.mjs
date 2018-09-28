export default class Component extends React.Component {
  constructor(...args) {
    super(...args);

    this._ref = () => <this.props.component />;
  }

  render() {
    return <div>{this._ref}</div>;
  }

}
