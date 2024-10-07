import type { Config } from "jest";
import { execSync } from 'child_process';
import { name } from './package.json';

const rootDirs = execSync(`pnpm --filter ${name}... exec pwd`)
  .toString()
  .split('\n')
  .filter(Boolean)
  .map((dir) => `${dir}/dist`);

const config: Config = {
  //   clearMocks: true,
  //   coverageProvider: "v8",
  roots: ["<rootDir>/src", ...rootDirs],
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
};

export default config;
