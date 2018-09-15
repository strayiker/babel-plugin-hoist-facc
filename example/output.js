import SuperComponent from './SuperComponent';

var _ref = ({
  prop
}) => <div>{prop}</div>;

class C extends React.Component {
  render() {
    return <SuperComponent {...this.props}>
        {_ref}
      </SuperComponent>;
  }

}
