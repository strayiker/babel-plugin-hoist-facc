export default class Component extends React.Component {
  render() {
    const {
      tag: Tag
    } = this.props;
    return <div>{() => <Tag />}</div>;
  }

}
