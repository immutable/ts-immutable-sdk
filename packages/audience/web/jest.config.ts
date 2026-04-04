import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '^@imtbl/audience$': '<rootDir>/../sdk/src/index.ts',
  },
};

export default config;
