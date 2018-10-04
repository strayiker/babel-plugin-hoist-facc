# babel-plugin-hoist-facc

> Treat [FACC](https://medium.com/merrickchristensen/function-as-child-components-5f3920a9ace9) as value types and hoist them to the highest scope

## Install

Using npm:

```sh
npm install --save-dev @babel/core babel-plugin-hoist-facc
```

or using yarn:

```sh
yarn add @babel/core babel-plugin-hoist-facc --dev
```

## What problem it solves?

It solves the problem of rendering optimization, which comes with `FaCC` pattern. In a few words: Function as Child Component can't be optimized by `shouldComponentUpdate` because the child function is always changes on render.

This plugin hoist the child function to highest possible scope to prevent its changes.

## Example

```javascript
class extends React.Component {
  render() {
    return <FaCC>{() => <div />}</FaCC>; // arrow function changes on each render
  }
}
```

⇩⇩⇩

```javascript
var _ref = () => <div />;

class extends React.Component {
  render() {
    return <FaCC>{_ref}</FaCC>; // now it's constant
  }
}
```

## Options

| Option             | Defaults | Description                                                                                                                                                                                                                              |
| ------------------ | :------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unsafeHoistInClass |  false   | When `true`, enables the hoisting of FaCC children function, which refers to `this`, to the class constructor. Potentially it is unsafe due to context losing issue, but in regular React life this should`t happens. See example below. |
| warnIfCantHoist    |  false   | When `true`, display a warnings about child functions that couldn't be hoisted.                                                                                                                                                          |
| loose              |  false   | When `true`, class properties are compiled to use an assignment expression instead of Object.defineProperty.                                                                                                                             |

## More examples

`["hoist-facc", { unsafeHoistInClass: true, loose: true }]`

```javascript
class extends React.Component {
  handleClick = () => {};

  render() {
    return <FaCC>{() => <button onClick={this.handleClick} />}</FaCC>;
  }
}
```

⇩⇩⇩

```javascript
class extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleClick = () => {};
    this._ref = () => <button onClick={this.handleClick} />;
  }

  render() {
    return <FaCC>{this._ref}</FaCC>;
  }
}
```

## Pitfalls

There some cases it can't be hoisted automagically.

```javascript
class extends React.Component {
  render() {
    const { id, label } = this.props;

    return <FaCC>{() => <div id={id}>{label}</div>}</FaCC>;
  }
}
```

The above code will not be transformed, because the `id` and `label` from the higher scope is used inside `FaCC`.
You should proxy the props to the child function or access props directly trought `this` keyword to avoid this.

```javascript
class extends React.Component {
  render() {
    return (
      <FaCC {...this.props}>
        {({ id }) => (
          <div id={id}>{this.props.label}</div>
        )}
      </FaCC>
    );
  }
}
```
