import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: { '^@imtbl/(.*)$': '<rootDir>/../../../node_modules/@imtbl/$1/src' },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
    '^.+\\.mjs?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    "../../../node_modules/.pnpm/(?!axios|@biom3/design-tokens)",
  ],
  modulePathIgnorePatterns: ['<rootDir>/.yalc'],
};

export default config;
