export default class Component extends React.Component {
  render() {
    return <div>{({ name }) => <span>{name}</span>}</div>;
  }
}
