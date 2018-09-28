import Facc from './Facc';

class Component extends React.Component {
  handleClick = () => {};

  render() {
    const asd1 = 0;
    return (
      <Facc>
        {() => {
          const { asd } = this.props;
          return <button onClick={this.handleClick}>{asd}</button>;
        }}
      </Facc>
    );
  }
}
