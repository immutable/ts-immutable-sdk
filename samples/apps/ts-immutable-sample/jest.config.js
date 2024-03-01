/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  moduleNameMapper: {
    "@imtbl/sdk/config": "<rootDir>/node_modules/@imtbl/sdk/dist/config",
    "@imtbl/sdk/passport": "<rootDir>/node_modules/@imtbl/sdk/dist/passport",
    "@/lib/env": "<rootDir>/src/lib/env",
    "@imtbl/generated-clients": "<rootDir>/../../../node_modules/@imtbl/generated-clients/dist"
  },
  modulePathIgnorePatterns: ["<rootDir>/tests/", "<rootDir>/tests-examples"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!uuid|(?!axios)|ng-dynamic)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

module.exports = config;
