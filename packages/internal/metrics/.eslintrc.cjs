module.exports = {
  "extends": ["../.eslintrc"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": ["./tsconfig.json", "./tsconfig.eslint.json"],
    "tsconfigRootDir": __dirname
  }
}
