import type { Config } from "jest";

const config: Config = {
  //   clearMocks: true,
  //   coverageProvider: "v8",
  moduleDirectories: ["node_modules", "src"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  //   transformIgnorePatterns: [],
  //   testEnvironmentOptions: {
  //     url: "http://localhost",
  //   },
  //   verbose: true,
  modulePathIgnorePatterns: ['<rootDir>/.yalc'],
};

export default config;
