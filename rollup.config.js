import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  // Big Kahuna export
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'types',
      }),
    ],
  },

  // Base export
  {
    input: 'src/base.ts',
    output: {
      file: 'dist/base.js',
      format: 'es',
    },
    plugins: [typescript()],
  },
  // StarkEx
  {
    input: 'src/modules/apis/starkex/index.ts',
    output: {
      file: 'dist/starkex.js',
      format: 'es',
    },
    plugins: [typescript()],
  },
  // Provider
  {
    input: 'src/modules/provider/index.ts',
    output: {
      file: 'dist/provider.js',
      format: 'es',
    },
    plugins: [typescript()],
  },
  // Passport
  {
    input: 'src/modules/passport/index.ts',
    output: {
      file: 'dist/passport.js',
      format: 'es',
    },
    plugins: [typescript()],
  },

  // Checkout
  {
    input: 'src/modules/checkout/index.ts',
    output: {
      file: 'dist/checkout.js',
      format: 'es',
    },
    plugins: [typescript()],
  },

  // Big Kahuna Types
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  // Base Types
  {
    input: 'dist/types/base.d.ts',
    output: {
      file: 'dist/base.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  // StarkEx Types
  {
    input: 'dist/types/modules/apis/starkex/index.d.ts',
    output: {
      file: 'dist/starkex.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  // Provider Types
  {
    input: 'dist/types/modules/provider/index.d.ts',
    output: {
      file: 'dist/provider.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  // Passport Types
  {
    input: 'dist/types/modules/passport/index.d.ts',
    output: {
      file: 'dist/passport.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  // Checkout Types
  {
    input: 'dist/types/modules/checkout/index.d.ts',
    output: {
      file: 'dist/checkout.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
