export default class Component extends React.Component {
  render() {
    return <div>{props => <span {...props} />}</div>;
  }
}
