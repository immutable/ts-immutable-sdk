module.exports = {
  root: true,
  env: {
    // browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    // sourceType: 'module',
    // ecmaFeatures: {
    //   jsx: true,
    // },
  },
  plugins: ['no-only-tests', 'simple-import-sort'],
  settings: {
    // react: {
    //   version: 'detect',
    // },
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
  extends: [
    'eslint:recommended',
    // 'plugin:@typescript-eslint/eslint-recommended', // included in @typescript-eslint/recommended
    'plugin:@typescript-eslint/recommended',
    // 'plugin:react/recommended',
    // 'plugin:jsx-a11y/recommended',
    // 'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    // 'plugin:@next/next/recommended',
    'plugin:prettier/recommended', // Make sure this is always the last element in the array.
  ],
  rules: {
    // '@next/next/no-img-element': 'off',
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    // 'react/react-in-jsx-scope': 'off',
    // 'react/prop-types': 'off',
    // 'react/self-closing-comp': [
    //   'error',
    //   {
    //     component: true,
    //     html: true,
    //   },
    // ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-only-tests/no-only-tests': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'import/no-named-as-default-member': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // 'jsx-a11y/anchor-is-valid': [
    //   'error',
    //   {
    //     components: ['Link', 'NextLink', 'StyledNextLink'],
    //     specialLink: ['hrefLeft', 'hrefRight'],
    //     aspects: ['invalidHref', 'preferButton'],
    //   },
    // ],
    // @TODO: we need to try and enable these at some point:
    // (they'll enforce consistency with the naming of styles)
    // '@typescript-eslint/naming-convention': [
    //   'error',
    //   {
    //     selector: 'variableLike',
    //     leadingUnderscore: 'forbid',
    //     trailingUnderscore: 'forbid',
    //     format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    //   },
    // ],
  },
  // @TODO: we need to try and enable these at some point:
  // (they'll enforce consistency with the naming of styles)
  // overrides: [
  //   {
  //     files: ['**/*.styles.ts'],
  //     rules: {
  //       '@typescript-eslint/naming-convention': [
  //         'error',
  //         {
  //           selector: 'variableLike',
  //           format: null,
  //           custom: {
  //             regex:
  //               '(^[A-Z]\\w+)|(^[A-Z]\\w+_\\w+$)|(^[A-Z]\\w+___\\w+$)|(^[A-Z]\\w+_\\w+___\\w+$)',
  //             match: true,
  //           },
  //         },
  //       ],
  //     },
  //   },
  // ],
};
