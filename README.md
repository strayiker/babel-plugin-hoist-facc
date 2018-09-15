# babel-plugin-hoist-facc

> Treat [FACC](https://medium.com/merrickchristensen/function-as-child-components-5f3920a9ace9) as value types and hoist them to the highest scope

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-hoist-facc
```

or using yarn:

```sh
yarn add babel-plugin-hoist-facc --dev
```

## What problem it solves?

It solves the render optimizition problem that comes with `FaCC` pattern. In a few words: Function as Child Component can't be optimized with `shouldComponentUpdate` because the child function changes on render.

This plugin hoist the child function to highest possible scope to prevent its changes.

## Example

> input.js

```javascript
import Super from './Super';

class C extends React.Component {
  render() {
    return <Super>{({ someProp }) => <div>{someProp}</div>}</Super>;
  }
}
```

> output.js

```javascript
import Super from './Super';

var _ref = ({ someProp }) => <div>{someProp}</div>;

class C extends React.Component {
  render() {
    return <Super>{_ref}</Super>;
  }
}
```

## Recomendations

Do not refer inside the `FaCC` to an identifiers from the outer scope. With this, the efficiency of hoisting will suffer.

> input.js

```javascript
import Super from './Super';

class C extends React.Component {
  render() {
    const { prop } = this.props;

    return <Super>{() => <div>{prop}</div>}</Super>;
  }
}
```

The above code will not be transformed, because the `prop` is used inside `FaCC`.
To avoid this, you should proxy the props from parent component (Super in this case).

> input.js

```javascript
import Super from './Super';

class C extends React.Component {
  render() {
    return <Super {...this.props}>{({ prop }) => <div>{prop}</div>}</Super>;
  }
}
```

> output.js

```javascript
import Super from './Super';

var _ref = ({ prop }) => <div>{prop}</div>;

class C extends React.Component {
  render() {
    return <Super {...this.props}>{_ref}</Super>;
  }
}
```
