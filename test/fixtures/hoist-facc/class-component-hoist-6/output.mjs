function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export default class Component extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "handleClick", () => {});

    _defineProperty(this, "_ref", () => <span onClick={this.handleClick} />);
  }

  render() {
    return <div>{this._ref}</div>;
  }

}
