module.exports = {
  "extends": ["../../.eslintrc", "airbnb", "airbnb-typescript"],
  "ignorePatterns": ["jest.config.*"],
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
        "format": ["camelCase","snake_case"]
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE", "snake_case"]
      },
      {
        "selector": "variable",
        "types": ["function"],
        "format": ["camelCase"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
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
        "format": ["camelCase","snake_case"]
      }
    ],
    "import/prefer-default-export": ["off"]
  }
}
