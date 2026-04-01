import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
};

export default config;
