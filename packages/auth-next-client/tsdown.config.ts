import { defineConfig, type UserConfig } from 'tsdown';

const baseConfig: UserConfig = {
  outDir: 'dist/node',
  format: ['esm', 'cjs'],
  target: 'es2022',
  platform: 'node',
  fixedExtension: false,
  dts: false,
  deps: { onlyBundle: false },
};

export default defineConfig([
  {
    ...baseConfig,
    entry: {
      index: 'src/index.ts',
    },
    clean: false,
    banner: {
      js: "'use client';",
    },
  },
]);
