import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '@imtbl/config': '<rootDir>../../../config/src'
  },
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  coveragePathIgnorePatterns:['node_modules', 'src/contracts/', 'src/test/'],
  transformIgnorePatterns: [],
};

export default config;
