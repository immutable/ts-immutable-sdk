/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
