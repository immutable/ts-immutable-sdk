/* eslint-disable */

import type { Config } from 'jest';

const swcJestConfig = {
  swcrc: false,
  jsc: {
    target: 'es2017',
    parser: {
      syntax: 'typescript',
      decorators: true,
      dynamicImport: true,
    },
    transform: {
      decoratorMetadata: true,
      legacyDecorator: true,
    },
    keepClassNames: true,
    externalHelpers: true,
    loose: true,
  },
  module: {
    type: 'es6',
    strict: true,
    noInterop: true,
  },
  sourceMaps: true,
};

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', swcJestConfig],
  },
  transformIgnorePatterns: [],
};

export default config;
