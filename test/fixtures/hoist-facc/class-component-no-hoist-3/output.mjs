import React from 'react';

function _warnAboutCantHoistFacc(fac) {
  _warnAboutCantHoistFacc = function (_fac) {
    return _fac;
  };

  console.error('Warning: Failed to hoist a child function. This can be due to the fact that it refers on an identifiers of the higher scope, what blocks the hoisting.');
  return fac;
}

const GLOBAL = 'GLOBAL';
export default class Component extends React.Component {
  render() {
    const {
      prop
    } = this.props;
    return <div>{_warnAboutCantHoistFacc(() => <span>{prop + GLOBAL}</span>)}</div>;
  }

}
