const { createJsdomJestConfig } = require('../../../jest.config.base.cjs');

module.exports = createJsdomJestConfig({
  moduleNameMapper: {
    '^@imtbl/audience-core$': '<rootDir>/../core/src/index.ts',
    '^@imtbl/audience-core/internal$': '<rootDir>/../core/src/internal.ts',
  },
});
