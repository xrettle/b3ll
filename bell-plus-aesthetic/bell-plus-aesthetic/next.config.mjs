/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Handle any image loading
  images: {
    unoptimized: true,
  },
  // Set source directory for page lookups
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Improve loading performance
  productionBrowserSourceMaps: false,
  
  // For better Netlify compatibility
  output: 'standalone',

  // Reduce function size with proper CSS optimization config
  experimental: {
    optimizeCss: {
      cssModules: true,
      // Configure critters for proper CSS inlining
      inlineThreshold: 0, // inline all CSS (no size threshold)
      pruneSource: false, // keep the original CSS
    },
    optimizePackageImports: ['react', 'framer-motion', 'lucide-react'],
    serverMinification: true,
  },
};

export default nextConfig;
