import type { Config } from 'jest';
import baseConfig from '../../../jest.config';

const config: Config = {
  ...baseConfig,
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
    '^.+\\.mjs?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!axios|@biom3/design-tokens)",
  ],
};

export default config;
