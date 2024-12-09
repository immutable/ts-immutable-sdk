module.exports = {
  "extends": ["../../.eslintrc"],
  "ignorePatterns": ["jest.config.*"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },
  "rules": {
    "implicit-arrow-linebreak": "off",
    "operator-linebreak": "off",
    "object-curly-newline": "off",
    "no-confusing-arrow": "off"
  }
}
