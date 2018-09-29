"use strict";

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Connected =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Connected, _React$Component);

  function Connected() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this._ref = function (ctx) {
      var label = _this.props.label;
      var value = ctx.value;
      return <Component label={label} value={value} />;
    };

    return _this;
  }

  var _proto = Connected.prototype;

  _proto.render = function render() {
    return <Consumer>
        {this._ref}
      </Consumer>;
  };

  return Connected;
}(React.Component);
