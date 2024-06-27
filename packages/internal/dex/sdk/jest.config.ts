import type { Config } from 'jest';
import baseConfig from '../../../../jest.config';

const config: Config = {
  ...baseConfig,
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  coveragePathIgnorePatterns: ['node_modules', 'src/contracts/', 'src/test/'],
  transformIgnorePatterns: [],
};

export default config;
