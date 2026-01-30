module.exports = {
  extends: ['../../.eslintrc'],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'import/order': 'off',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/default': 'off',
    'import/namespace': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'react/require-default-props': 'off',
  },
};
