import Facc from './Facc';

class Component extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleClick = () => {};

    this._ref = () => {
      const {
        asd
      } = this.props;
      return <button onClick={this.handleClick}>{asd}</button>;
    };
  }

  render() {
    const asd1 = 0;
    return <Facc>
        {this._ref}
      </Facc>;
  }

}
