/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  rootDir: ".",
  testMatch:["**/*.steps.ts", "**/*.spec.ts"],
  testTimeout: 120000,
  roots: ["step-definitions", "specs"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "@imtbl/sdk/provider": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/provider",
    "@imtbl/sdk/config": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/config",
    "@imtbl/sdk/x_client": "<rootDir>/../../../node_modules/@imtbl/sdk/dist/x_client"
  },
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!uuid|(?!axios)|ng-dynamic)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],
};

export default config;
