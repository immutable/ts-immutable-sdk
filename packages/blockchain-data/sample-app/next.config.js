/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@imbtl/*'],
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
