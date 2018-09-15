import SuperComponent from './SuperComponent';

class C extends React.Component {
  render() {
    return (
      <SuperComponent {...this.props}>
        {({ prop }) => <div>{prop}</div>}
      </SuperComponent>
    );
  }
}
