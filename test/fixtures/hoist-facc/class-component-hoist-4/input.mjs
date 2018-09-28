const GLOBAL = 'constant';

export default class Component extends React.Component {
  render() {
    return <div>{() => <span>{GLOBAL}</span>}</div>;
  }
}
