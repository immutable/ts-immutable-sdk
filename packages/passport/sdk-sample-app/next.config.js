
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
  // Use .page.* extensions for Pages Router pages in src/pages
  // Standard extensions are also needed for App Router to work
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'tsx', 'ts', 'jsx', 'js'],
  // Static export when API routes are disabled
  // When enabled, App Router route handlers in /app/api are used
  ...(!enableApiRoutes && { output: 'export' }),
  reactStrictMode: true,
  // Enable App Router experimental features if needed
  experimental: {
    // Allow App Router and Pages Router to coexist
  },
};

module.exports = nextConfig
