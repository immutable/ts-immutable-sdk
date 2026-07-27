// @ts-check
import { defineConfig } from 'tsdown';
import { replacePlugin } from '../../../tsdown.base.ts';
import pkg from './package.json' with { type: 'json' };

export default defineConfig((options) => {
  if (options.watch) {
    return {
      entry: 'src/index.ts',
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      platform: 'node',
      fixedExtension: false,
      dts: false,
      deps: { onlyBundle: false },
      plugins: [replacePlugin({ __SDK_VERSION__: pkg.version })],
    };
  }

  return [
    {
      entry: 'src/index.ts',
      outDir: 'dist',
      platform: 'node',
      fixedExtension: false,
      format: ['esm', 'cjs'],
      target: 'es2022',
      minify: true,
      dts: false,
      deps: { onlyBundle: false },
      plugins: [replacePlugin({ __SDK_VERSION__: pkg.version })],
    },
  ];
});
