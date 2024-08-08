module.exports = {
  "extends": ["../../../.eslintrc"],
  "ignorePatterns": ["jest.config.*", "rollup.config.*"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },
  "rules": {
    "prefer-promise-reject-errors": "off",
    "max-len": ["error", { "comments": 140, "code": 120 }],
    "no-continue": 0
  }
}
