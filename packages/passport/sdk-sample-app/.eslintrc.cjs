module.exports = {
  root: true, // Prevent ESLint from looking up and applying parent's ignorePatterns
  // Only extend Next.js config to avoid plugin conflicts with root .eslintrc
  extends: ['next/core-web-vitals'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Rules from root .eslintrc that are needed
    'import/prefer-default-export': ['off'],
    'no-console': 'off',
    'no-plusplus': ['off'],
    'max-classes-per-file': ['off'],
    'max-len': [
      'error',
      { code: 120, ignoreComments: true, ignoreTrailingComments: true },
    ],
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'import/no-extraneous-dependencies': ['off'],
    '@typescript-eslint/return-await': ['off'],
    '@typescript-eslint/naming-convention': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/heading-has-content': 'off',
  },
};

