import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'umd',
    name: 'CheckoutWidgets',
    inlineDynamicImports: true
  },
  plugins: [
    resolve({
      browser: true,
      dedupe: ['react', 'react-dom'],
    }),
    json(),
    commonjs(),
    typescript({
      tsconfig: 'tsconfig.json',
      sourceMap: true,
      inlineSources: true,
    })
  ],
  
};
