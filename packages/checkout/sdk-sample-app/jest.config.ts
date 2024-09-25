import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['<rootDir>/.yalc'],
};

export default config;
