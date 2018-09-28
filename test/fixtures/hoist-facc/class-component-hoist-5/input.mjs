class Component extends React.Component {
  render() {
    return <div>{() => <span>{GLOBAL}</span>}</div>;
  }
}

const GLOBAL = 'constant';

export default Component;
