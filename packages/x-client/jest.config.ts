import type { Config } from 'jest';
import { execSync } from 'child_process';
import { name } from './package.json';

const rootDirs = execSync(`pnpm --filter ${name}... exec pwd`)
  .toString()
  .split('\n')
  .filter(Boolean)
  .map((dir) => `${dir}/dist`);
  
const config: Config = {
  roots: ['<rootDir>/src', ...rootDirs],
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/backup/'],
  moduleNameMapper: { '^@imtbl/(.*)$': '<rootDir>/../../node_modules/@imtbl/$1/src' },
  testRegex: '^.+\\.test\\.(js|ts|jsx|tsx)$',
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    'node_modules\//(?!node-fetch)/',
  ],
};

export default config
