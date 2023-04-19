import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve({
      resolveOnly: [
        '@uniswap/router-sdk',
        '@uniswap/swap-router-contracts',
        '@uniswap/v3-core',
        '@uniswap/v3-periphery',
        '@uniswap/v3-sdk',
        'ethers',
      ],
    }),
    typescript({
      exclude: ['**/ABIs/*', '**/*.test.*', '**/utils/testUtils.ts'],
    }),
  ],
};
