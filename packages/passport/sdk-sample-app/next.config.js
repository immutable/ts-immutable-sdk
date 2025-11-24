
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
let pathConfig = {};

if (basePath) {
  pathConfig = {
    basePath,
    assetPrefix: basePath,
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...pathConfig,
  typescript: {
    tsconfigPath: './tsconfig.build.json',
  },
  output: 'export',
  reactStrictMode: true,
  // Transpile workspace packages and Sequence packages to handle SSR properly
  transpilePackages: [
    '@imtbl/passport',
    '@imtbl/config',
    '@imtbl/toolkit',
    '@imtbl/x-client',
    '@imtbl/orderbook',
    '@imtbl/blockchain-data',
    '@imtbl/generated-clients',
    '@imtbl/x-provider',
    '@0xsequence/wallet-wdk',
    '@0xsequence/identity-instrument',
    '@0xsequence/wallet-core',
    '@0xsequence/abi',
    '@0xsequence/core',
    '@0xsequence/auth',
    '@0xsequence/network',
  ],
  // Configure webpack to handle these packages
  webpack: (config, { isServer, webpack }) => {
    // Prefer source files over built files for workspace packages in development
    config.resolve.alias = {
      ...config.resolve.alias,
      '@imtbl/passport': require('path').resolve(__dirname, '../sdk/src'),
      '@imtbl/config': require('path').resolve(__dirname, '../../config/src'),
      '@imtbl/toolkit': require('path').resolve(__dirname, '../../internal/toolkit/src'),
      '@imtbl/x-client': require('path').resolve(__dirname, '../../x-client/src'),
      '@imtbl/orderbook': require('path').resolve(__dirname, '../../orderbook/src'),
      '@imtbl/blockchain-data': require('path').resolve(__dirname, '../../blockchain-data/sdk/src'),
      '@imtbl/generated-clients': require('path').resolve(__dirname, '../../internal/generated-clients/src'),
      '@imtbl/x-provider': require('path').resolve(__dirname, '../../x-provider/src'),
    };
    
    // Add workspace root node_modules to resolution paths so @0xsequence packages can be found
    // (pnpm hoists packages to workspace root)
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      require('path').resolve(__dirname, '../../../node_modules'),
      require('path').resolve(__dirname, '../sdk/node_modules'),
      require('path').resolve(__dirname, 'node_modules'),
    ];
    
    // Ensure crypto is properly polyfilled for @0xsequence packages
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );
    
    if (!isServer) {
      // Ensure these packages are bundled for the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
    }
    return config;
  },
};

module.exports = nextConfig
