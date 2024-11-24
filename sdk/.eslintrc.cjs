module.exports = {
  "ignorePatterns": ["jest.config.*"],
  "extends": ["../.eslintrc"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname,
    "sourceType": "module"
  },
  "rules": {
    "import/no-extraneous-dependencies": ["off"],
    "import/export": ["off"]
  }
}
