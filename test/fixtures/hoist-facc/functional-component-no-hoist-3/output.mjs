function _warnAboutCantHoistFacc(fac) {
  _warnAboutCantHoistFacc = function () {
    return fac;
  };

  console.error('Warning: Failed to hoist a child function. This can be due to the fact that it refers on an identifiers of the higher scope, what blocks the hoisting.');
  return fac;
}

export default (props => <div>{_warnAboutCantHoistFacc(() => <span>{props.outer}</span>)}</div>);
