module.exports = {
  "extends": ["../../../.eslintrc"],
  "ignorePatterns": ["jest.config.*", "rollup.config.*"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "default",
        "format": ["camelCase"]
      },
      {
        "selector": "objectLiteralProperty",
        "format": ["camelCase"]
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "variable",
        "types": ["function"],
        "format": ["camelCase", "PascalCase"]
      },
      {
        "selector": "function",
        "format": ["camelCase", "PascalCase"]
      },
      {
        "selector": "parameter",
        "format": ["camelCase"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "class",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      },
      {
        "selector": "enumMember",
        "format": ["UPPER_CASE"]
      },
      {
        "selector": "memberLike",
        "modifiers": ["private"],
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      },
      {
        "selector": "typeProperty",
        "format": ["camelCase"]
      }
    ],
    "prefer-promise-reject-errors": "off",
    "class-methods-use-this": ["off"],
    "react/require-default-props": ["off"],
    "react/react-in-jsx-scope": ["off"],
    "jsx-a11y/anchor-is-valid": "off",
    "jsx-a11y/anchor-has-content": "off",
    "jsx-a11y/control-has-associated-label": "off",
    "react/jsx-props-no-spreading": "off",
    "implicit-arrow-linebreak": "off",
  }
}
