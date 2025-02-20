module.exports = {
  "extends": ["../.eslintrc"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },  
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "objectLiteralProperty",
        "format": ["camelCase", "snake_case"]
      }
    ]
  }
}
