module.exports = {
  extends: ['../../../.eslintrc'],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'no-underscore-dangle': ['error', { allow: ['__imtbl', '_loaded'] }],
  },
};
