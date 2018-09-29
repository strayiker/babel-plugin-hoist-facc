import { declare } from '@babel/helper-plugin-utils';
import jsxPlugin from '@babel/plugin-syntax-jsx';
import PathHoister from './utils/PathHoister';
import isFacc from './utils/isFacc';

const TYPES = ['ArrowFunctionExpression', 'FunctionExpression'].join('|');

export default declare((api, options) => {
  api.assertVersion(7);

  const hoister = new PathHoister(options);
  const faccVisitor = {
    [TYPES](path, state) {
      if (!isFacc(path)) {
        return;
      }

      hoister.run(path, state);
    }
  };

  return {
    visitor: {
      // Force performing before babel-plugin-transform-classes (https://babeljs.io/docs/en/next/babel-plugin-transform-classes.html)
      // see https://jamie.build/babel-plugin-ordering.html for details
      Program(path, state) {
        path.traverse(faccVisitor, state);
      }
    },
    inherits: jsxPlugin
  };
});
