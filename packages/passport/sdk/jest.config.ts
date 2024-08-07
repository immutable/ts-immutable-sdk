import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '@imtbl/config': '<rootDir>../../config/src',
    '@imtbl/metrics': '<rootDir>../../internal/metrics/src',
    '@imtbl/generated-clients': '<rootDir>../../internal/generated-clients/src',
    '@imtbl/guardian': '<rootDir>../../internal/guardian/src',
    '@imtbl/x-client': '<rootDir>../../x-client/src',
    '@imtbl/toolkit': '<rootDir>../../internal/toolkit/src',
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [],
};

export default config;
