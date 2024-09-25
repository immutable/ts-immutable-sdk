/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  rootDir: ".",
  testMatch:["**/*.steps.ts"],
  testTimeout: 60000,
  roots: ["step-definitions"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "@imtbl/sdk/provider": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/provider",
    "@imtbl/sdk/config": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/config",
    "@imtbl/sdk/x_client": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/x_client",
    "@imtbl/generated-clients": "<rootDir>/../../../node_modules/@imtbl/generated-clients/dist"
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
