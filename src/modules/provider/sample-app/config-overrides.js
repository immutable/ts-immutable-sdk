const webpack = require("webpack");

// config-overrides.js
module.exports = function override(config, env) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        // ENABLE OR DISABLE YOUR POLYFILLS HERE
        crypto: require.resolve("crypto-browserify"),
        assert: require.resolve("assert-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/")
      });
    
    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ]);
    config.resolve.extensions.push(".mjs");
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config
}
