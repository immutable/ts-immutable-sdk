import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '\\.ts$': ['babel-jest', { configFile: './babel.test.config.js' }],
  },
  transformIgnorePatterns: ['node_modules/(?!axios)'],
};

export default config;
