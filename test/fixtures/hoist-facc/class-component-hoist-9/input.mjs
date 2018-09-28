export default class Component extends React.Component {
  render() {
    return <div>{() => <this.props.component />}</div>;
  }
}
