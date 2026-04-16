import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '^@imtbl/audience-core$': '<rootDir>/../core/src/index.ts',
    // The core source code imports other @imtbl packages (e.g. metrics).
    // This tells jest where to find them so we can run tests without
    // building the whole monorepo first.
    '^@imtbl/(.*)$': '<rootDir>/../../../node_modules/@imtbl/$1/src',
  },
};

export default config;
