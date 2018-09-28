const GLOBAL = 'constant';

export default () => <div>{() => <span>{GLOBAL}</span>}</div>;
