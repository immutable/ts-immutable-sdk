
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
  // Static export disables API routes.
  // Set ENABLE_API_ROUTES=true to enable API routes (required for auth-nextjs)
  ...(process.env.ENABLE_API_ROUTES !== 'true' && { output: 'export' }),
  reactStrictMode: true,
};

module.exports = nextConfig
