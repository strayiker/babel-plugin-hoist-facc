import { declare } from '@babel/helper-plugin-utils';
import jsxPlugin from '@babel/plugin-syntax-jsx';
import PathHoister from './utils/PathHoister';
import isFacc from './utils/isFacc';

const TYPES = ['ArrowFunctionExpression', 'FunctionExpression'].join('|');

export default declare((api, options) => {
  api.assertVersion(7);

  const hoister = new PathHoister(options);

  return {
    visitor: {
      [TYPES](path, state) {
        if (!isFacc(path)) {
          return;
        }

        hoister.run(path, state);
      }
    },
    inherits: jsxPlugin
  };
});
