
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
  reactStrictMode: true,
  webpack: (config) => {
    const name = "default";

    class ConditionalExportsPlugin {
      apply(compiler) {
        compiler.hooks.afterEnvironment.tap("ConditionalExportsPlugin", () => {
          compiler.options.resolve.conditionNames = [...compiler.options.resolve.conditionNames, name]
        });
      }
    }
  
    config.plugins.push(new ConditionalExportsPlugin());

    return config;
  }
};

module.exports = nextConfig
