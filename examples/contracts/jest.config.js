/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  moduleNameMapper: {
    '^@imtbl/contracts$': '<rootDir>/test/__mocks__/@imtbl/contracts.ts',
  },
  setupFiles: ['dotenv/config'],
};
