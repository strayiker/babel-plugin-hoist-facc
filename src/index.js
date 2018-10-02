import { types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import jsxPlugin from '@babel/plugin-syntax-jsx';
import PathHoister from './utils/PathHoister';
import isFacc from './utils/isFacc';
import { buildWarning } from './helpers';

const TYPES = ['ArrowFunctionExpression', 'FunctionExpression'].join('|');

export default declare((api, options) => {
  api.assertVersion(7);

  const { warnIfCantHoist = false } = options;
  const hoister = new PathHoister(options);

  const faccVisitor = {
    [TYPES](path, state) {
      if (!isFacc(path)) {
        return;
      }

      if (hoister.run(path, state)) {
        return;
      }

      if (warnIfCantHoist) {
        path.replaceWith(
          t.expressionStatement(
            t.callExpression(state.addWarnHelper(), [path.node]),
          ),
        );
      }
    },
  };

  return {
    visitor: {
      // Force performing before babel-plugin-transform-classes (https://babeljs.io/docs/en/next/babel-plugin-transform-classes.html)
      // see https://jamie.build/babel-plugin-ordering.html for details
      Program(path, state) {
        // eslint-disable-next-line no-param-reassign
        state.addWarnHelper = () => {
          const lastImport = path
            .get('body')
            .filter(p => p.isImportDeclaration())
            .pop();

          const uid = path.scope.generateUidIdentifier(
            'warnAboutCantHoistFacc',
          );
          const helper = buildWarning({ ID: uid });
          const insert = lastImport
            ? () => lastImport.insertAfter(helper)
            : () => path.unshiftContainer('body', helper);

          insert();

          return uid;
        };

        path.traverse(faccVisitor, state);
      },
    },
    inherits: jsxPlugin,
  };
});
