/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  extends: ['../../.eslintrc'],
  ignorePatterns: ['jest.config.*', 'rollup.config.*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
  },
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'error',
  },
};
