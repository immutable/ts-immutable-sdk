module.exports = {
  "extends": ["../.eslintrc"],
  "ignorePatterns": [],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },
  "rules": {
    "no-restricted-syntax": "off",
    "@typescript-eslint/naming-convention": "off"
  }
}
