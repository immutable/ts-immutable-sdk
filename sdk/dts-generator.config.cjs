/** @type {import('dts-bundle-generator/config-schema').BundlerConfig} */
module.exports = {
  entries: [
    {
      filePath: 'dist/types/index.d.ts',
      outFile: 'dist/index.d.ts',
      libraries: {
        inlinedLibraries: ['ethers'],
      },
      output: {
        inlineDeclareExternals: true,
        inlineDeclareGlobals: true,
        exportReferencedTypes: false,
      },
    },
  ],
};
