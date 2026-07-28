const { createJsdomJestConfig } = require('../../../jest.config.base.cjs');

module.exports = createJsdomJestConfig({
  transform: {
    '^.+\.(t|j)sx?$': '@swc/jest',
    '^.+\.mjs?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    '../../../node_modules/.pnpm/(?!axios|@biom3/design-tokens)',
  ],
});
