/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static site generation for our dynamic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig; 