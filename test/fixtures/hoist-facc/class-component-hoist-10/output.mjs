function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

let Component =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Component, _React$Component);

  function Component(...args) {
    var _this;

    _this = _React$Component.call(this, ...args) || this;

    _this.handleClick = () => {};

    _this._ref = () => <button onClick={_this.handleClick} />;

    return _this;
  }

  var _proto = Component.prototype;

  _proto.render = function render() {
    return <div>{this._ref}</div>;
  };

  return Component;
}(React.Component);

export { Component as default };
