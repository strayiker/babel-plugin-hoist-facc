import template from '@babel/template';

export const buildWarning = template`
  function ID(fac) {
    ID = function (_fac) { return _fac };
    console.error('Warning: Failed to hoist a child function. This can be due to the fact that it refers on an identifiers of the higher scope, what blocks the hoisting.');
    return fac;
  }
`;
