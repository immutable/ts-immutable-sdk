module.exports = {
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage/jest',
  coverageReporters: ['text', 'text-summary', 'json', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testRegex: '^.+\\.test\\.(js|ts|jsx|tsx)$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '^.+\\.cypress\\.test\\.(js|ts|jsx|tsx)$',
    'starkCurve.test.ts', // These tests are run via Mocha!!
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};
