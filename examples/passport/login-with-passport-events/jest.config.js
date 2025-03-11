module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.jest.js' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@biom3|@imtbl)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  modulePathIgnorePatterns: ['.next'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
}; 