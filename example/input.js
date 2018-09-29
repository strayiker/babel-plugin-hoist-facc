class Connected extends React.Component {
  render() {
    return (
      <Consumer>
        {ctx => {
          const { label } = this.props;
          const { value } = ctx;

          return <Component label={label} value={value} />;
        }}
      </Consumer>
    );
  }
}
