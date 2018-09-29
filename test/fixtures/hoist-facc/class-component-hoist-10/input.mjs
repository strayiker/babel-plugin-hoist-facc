export default class Component extends React.Component {
  handleClick = () => {};

  render() {
    return <div>{() => <button onClick={this.handleClick} />}</div>;
  }
}
