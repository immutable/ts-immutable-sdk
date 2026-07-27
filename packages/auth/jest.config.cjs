const { createJsdomJestConfig } = require('../../jest.config.base.cjs');

module.exports = createJsdomJestConfig({
  restoreMocks: true,
  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],
});
