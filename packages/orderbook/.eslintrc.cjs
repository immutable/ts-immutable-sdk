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
    "import/prefer-default-export": ["off"],
    "no-restricted-imports": [
      "error",
      {
        "paths": [],
        // Importing types from seaport-js using a relative path (e.g. @opensea/seaport-js/lib/constants)
        // can cause issues for consumers of the SDK, e.g: https://github.com/immutable/ts-immutable-sdk/issues/2472.
        // Instead, alias or duplicate the types in src/seaport/types.ts and import from there.
        "patterns": ["@opensea/seaport-js/*"]
      }
    ]
  }
}
