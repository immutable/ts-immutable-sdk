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
  coverageThreshold: {
    global: {
      lines: 80,
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/app/tests/setup.js'],
}; 