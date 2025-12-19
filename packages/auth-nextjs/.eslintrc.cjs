module.exports = {
  extends: ['../../.eslintrc'],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Disable all import plugin rules due to stack overflow with auth package structure
    'import/order': 'off',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/default': 'off',
    'import/namespace': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    // Allow optional props without defaultProps in functional components (use destructuring defaults)
    'react/require-default-props': 'off',
  },
};