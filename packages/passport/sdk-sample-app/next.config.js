
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
  // Transpile packages to resolve ESM/CJS compatibility issues with pnpm
  transpilePackages: ['next-auth', '@auth/core', '@imtbl/auth-next-client', '@imtbl/auth-next-server'],
  // Experimental settings for module resolution
  experimental: {
    // Ensure proper server component handling for auth packages
    serverComponentsExternalPackages: [],
  },
  // Ensure next-auth/react imports resolve to the same instance
  // This is critical for React Context (SessionProvider) to work across packages in the monorepo
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth/react': require.resolve('next-auth/react'),
    };
    return config;
  },
};

module.exports = nextConfig
