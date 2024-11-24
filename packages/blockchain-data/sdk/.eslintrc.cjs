module.exports = {
  "extends": ["../../../.eslintrc"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },
  "rules": {
    "@typescript-eslint/comma-dangle": "off"
  }
}
