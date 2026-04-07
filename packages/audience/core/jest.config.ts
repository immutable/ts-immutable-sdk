import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: { '^@imtbl/(.*)$': '<rootDir>/../../../node_modules/@imtbl/$1/src' },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [],
};

export default config;
