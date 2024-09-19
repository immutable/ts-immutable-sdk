module.exports = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/src', '<rootDir>/.yalc'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/backup/'],
  moduleNameMapper: { '^@imtbl/(.*)$': '<rootDir>/../../node_modules/@imtbl/$1/src' },
  testRegex: '^.+\\.test\\.(js|ts|jsx|tsx)$',
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    'node_modules\//(?!node-fetch)/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.yalc'],
};
