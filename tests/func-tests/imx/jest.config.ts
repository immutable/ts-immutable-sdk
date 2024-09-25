/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  rootDir: ".",
  testMatch:["**/*.steps.ts"],
  testTimeout: 60000,
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "@imtbl/sdk/config": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/config",
    "@imtbl/sdk/x": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/x",
    "@imtbl/generated-clients": "<rootDir>/../../../node_modules/@imtbl/generated-clients/dist",
  },
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!uuid|(?!axios)|ng-dynamic)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/.yalc'],
};

export default config;
