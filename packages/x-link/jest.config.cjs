module.exports = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/backup/'],
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
};
