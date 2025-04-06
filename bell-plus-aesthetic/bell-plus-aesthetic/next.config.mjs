/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Handle any image loading
  images: {
    unoptimized: true,
  },
  // Explicitly enable app directory
  experimental: {
    appDir: true,
  },
  // Set source directory for page lookups
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default nextConfig;
