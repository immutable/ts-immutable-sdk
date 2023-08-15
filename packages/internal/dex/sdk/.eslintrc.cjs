/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  extends: ['../../.eslintrc'],
  ignorePatterns: ['jest.config.*', 'rollup.config.*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'error',
  },
};
