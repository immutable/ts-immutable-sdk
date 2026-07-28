const { createJsdomJestConfig } = require('../../../../jest.config.base.cjs');

module.exports = createJsdomJestConfig({
  verbose: true,
  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/contracts/',
    'src/test/',
  ],
});
