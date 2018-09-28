export default class Component extends React.Component {
  render() {
    const {
      text
    } = this.props;
    return <div>{() => <span>{text}</span>}</div>;
  }

}
