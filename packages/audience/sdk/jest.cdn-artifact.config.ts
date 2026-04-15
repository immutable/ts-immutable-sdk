import type { Config } from 'jest';

// Runs the CDN artifact smoke test in isolation from the default suite.
// Default suite (jest.config.ts) scopes to src/ and tests TypeScript source;
// this config scopes to test/ and asserts against the built IIFE in dist/cdn.
const config: Config = {
  roots: ['<rootDir>/test'],
  // jsdom, not node: at least one transitive dep in the bundle touches a
  // browser global (navigator, sessionStorage, or similar) during module
  // init, so a bare node realm throws before the side-effect global
  // assignment runs. jsdom provides those globals, matching the real
  // <script>-tag target environment the bundle is built for.
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};

export default config;
