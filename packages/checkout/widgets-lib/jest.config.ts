import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '@imtbl/bridge-sdk': '<rootDir>../../internal/bridge/sdk/src',
    '@imtbl/checkout-sdk': '<rootDir>../sdk/src',
    '@imtbl/config': '<rootDir>../../config/src',
    '@imtbl/cryptofiat': '<rootDir>../../internal/cryptofiat/src',
    '@imtbl/dex-sdk': '<rootDir>../../internal/dex/sdk/src',
    '@imtbl/orderbook': '<rootDir>../../orderbook/src',
    '@imtbl/blockchain-data': '<rootDir>../../blockchain-data/sdk/src',
    '@imtbl/generated-clients': '<rootDir>../../internal/generated-clients/src'
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!axios)"
  ],
};

export default config;
