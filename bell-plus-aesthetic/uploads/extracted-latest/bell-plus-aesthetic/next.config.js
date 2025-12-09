/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Setting this to false to avoid potential minification issues
  experimental: {
    appDir: true,
  },
  // Ensure proper asset handling
  images: {
    domains: [],
    unoptimized: true,
  },
  // Avoid debug mode in production
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
