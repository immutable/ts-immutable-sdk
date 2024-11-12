module.exports = {
  "extends": ["../../../.eslintrc"],
  "ignorePatterns": ["jest.config.*"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },
  "rules": {
    "no-underscore-dangle": "off",
    "prefer-promise-reject-errors": "off",
    "max-len": ["error", { "comments": 140, "code": 120 }],
    "no-continue": 0
  }
}
