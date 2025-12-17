
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const enableApiRoutes = process.env.ENABLE_API_ROUTES === 'true';

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
  // Only include .api.ts/.api.tsx extensions when API routes are enabled
  // This allows static export to work by excluding API route files
  pageExtensions: enableApiRoutes
    ? ['tsx', 'ts', 'jsx', 'js', 'api.tsx', 'api.ts']
    : ['tsx', 'ts', 'jsx', 'js'],
  // Static export when API routes are disabled
  ...(!enableApiRoutes && { output: 'export' }),
  reactStrictMode: true,
};

module.exports = nextConfig
