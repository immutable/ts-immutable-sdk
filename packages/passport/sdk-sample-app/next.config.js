
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const enableApiRoutes = process.env.ENABLE_API_ROUTES === 'true';

let pathConfig = {};

if (basePath) {
  pathConfig = {
    basePath,
    assetPrefix: basePath,
  }
}

// Page extensions configuration:
// - Always include .page.* for Pages Router pages in src/pages
// - Only include standard extensions (tsx, ts, jsx, js) when API routes are enabled
//   This prevents App Router route.ts files from being built during static export
const pageExtensions = enableApiRoutes
  ? ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'tsx', 'ts', 'jsx', 'js']
  : ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...pathConfig,
  typescript: {
    tsconfigPath: './tsconfig.build.json',
  },
  pageExtensions,
  // Static export when API routes are disabled
  ...(!enableApiRoutes && { output: 'export' }),
  reactStrictMode: true,
};

module.exports = nextConfig
