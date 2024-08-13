module.exports = {
  "ignorePatterns": ["jest.config.*"],
  "extends": ["../../.eslintrc"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname,
  },
  "rules": {
    "max-len": [
      "error",
      {
        "code": 120,
        "comments": 140,
        "ignoreTemplateLiterals": true
      }
    ]
  }
}
