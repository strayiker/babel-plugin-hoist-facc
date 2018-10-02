import React from 'react';

const GLOBAL = 'GLOBAL';

export default class Component extends React.Component {
  render() {
    const { prop } = this.props;

    return <div>{() => <span>{prop + GLOBAL}</span>}</div>;
  }
}
