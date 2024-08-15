import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@imtbl/(.*)$': '<rootDir>/../../../../node_modules/@imtbl/$1',
  },
};

export default config;
