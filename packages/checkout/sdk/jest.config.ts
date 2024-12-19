import type { Config } from 'jest';
import { execSync } from 'child_process';
import { name } from './package.json';

const rootDirs = execSync(`pnpm --filter ${name}... exec pwd`)
  .toString()
  .split('\n')
  .filter(Boolean)
  .map((dir) => `${dir}/dist`);

const config: Config = {
  clearMocks: true,
  roots: ['<rootDir>/src', ...rootDirs],
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: { '^@imtbl/(.*)$': '<rootDir>/../../../node_modules/@imtbl/$1/src' },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [],
  setupFiles: [],
};

export default config;
