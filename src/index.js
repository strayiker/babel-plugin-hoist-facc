import { declare } from '@babel/helper-plugin-utils';
import jsxPlugin from '@babel/plugin-syntax-jsx';
import PathHoister from './utils/PathHoister';
import isFacc from './utils/isFacc';

const TYPES = ['ArrowFunctionExpression', 'FunctionExpression'].join('|');

export default declare(api => {
  api.assertVersion(7);

  const hoister = new PathHoister();

  return {
    visitor: {
      [TYPES](path) {
        if (!isFacc(path)) {
          return;
        }

        hoister.reset(path, path.scope.parent);
        hoister.run();
      },
    },
    inherits: jsxPlugin,
  };
});
