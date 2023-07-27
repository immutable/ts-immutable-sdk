
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
  reactStrictMode: true,
};

module.exports = nextConfig
