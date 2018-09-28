export default class Component extends React.Component {
  handleClick = () => {};

  render() {
    return <div>{() => <span onClick={this.handleClick} />}</div>;
  }
}
