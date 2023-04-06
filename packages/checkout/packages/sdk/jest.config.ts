import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '\\.ts$': ['babel-jest', { configFile: './babel.test.config.js' }],
  },
};

export default config;
