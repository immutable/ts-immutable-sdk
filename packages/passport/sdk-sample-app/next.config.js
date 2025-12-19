
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
  // Use .page.* extensions for regular pages and .api.* for API routes
  // When API routes are disabled, only .page.* files are included (excludes .api.* files)
  // This allows static export to work by excluding API route files
  pageExtensions: enableApiRoutes
    ? ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'api.tsx', 'api.ts']
    : ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  // Static export when API routes are disabled
  ...(!enableApiRoutes && { output: 'export' }),
  reactStrictMode: true,
};

module.exports = nextConfig
