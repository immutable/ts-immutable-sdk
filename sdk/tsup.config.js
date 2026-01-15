// @ts-check
import { defineConfig } from 'tsup'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

// Packages that should NOT be bundled - they are peer dependencies
// and should use the consumer's installed version
const peerDepsExternal = [
  'next',
  'next-auth',
  'next/navigation',
  'next/headers',
  'next/server',
  'react',
  'react-dom',
];

// Browser-only packages that access navigator/window at module load time
// These MUST be externalized for server/Edge Runtime entry points
const browserOnlyPackages = [
  '@imtbl/auth',
  '@imtbl/metrics',
  'oidc-client-ts',
  'localforage',
];

// Entry points that run in server/Edge Runtime and must NOT include browser-only code
const serverEntryPoints = [
  'src/auth_nextjs_server.ts',
];

// All other entry points (excluding server and browser-specific ones)
const standardEntryPoints = [
  'src',
  '!src/index.browser.ts',
  ...serverEntryPoints.map(e => `!${e}`),
];

export default defineConfig((options) => {
  if (options.watch) {
    // Watch mode
    return {
      entry: ['src'],
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      bundle: false,
    }
  }
  
  return [
    // Server/Edge Runtime entries - MUST externalize browser-only packages
    // These are used in Next.js middleware where navigator/window don't exist
    {
      entry: serverEntryPoints,
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      bundle: true,
      treeshake: true,
      splitting: false,
      external: [...peerDepsExternal, ...browserOnlyPackages],
    },
    {
      entry: serverEntryPoints,
      outDir: 'dist',
      platform: 'node',
      format: 'cjs',
      target: 'es2022',
      bundle: true,
      treeshake: true,
      external: [...peerDepsExternal, ...browserOnlyPackages],
    },

    // Standard entries - Node & Browser Bundle for ESM
    {
      entry: standardEntryPoints,
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      bundle: true,
      treeshake: true,
      splitting: false,
      external: peerDepsExternal,
    },

    // Standard entries - Node Bundle for CJS
    {
      entry: standardEntryPoints,
      outDir: 'dist',
      platform: 'node',
      format: 'cjs',
      target: 'es2022',
      bundle: true,
      treeshake: true,
      external: peerDepsExternal,
    },

    // Browser Bundle for CDN
    {
      entry: ['src/index.browser.ts'],  
      outExtension: () => ({ js: '.cdn.js' }),
      outDir: 'dist',
      platform: 'browser',
      format: 'iife',
      target: 'es2022',
      globalName: 'immutable',
      bundle: true,
      minify: true,
      splitting: false,
      skipNodeModulesBundle: false,
      noExternal: [/.*/],
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            Buffer: true,
            process: true,
          },
          modules: ['crypto', 'buffer', 'process', 'path', 'fs']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    }
  ]
})