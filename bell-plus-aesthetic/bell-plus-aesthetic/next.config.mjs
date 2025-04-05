import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set the source directory for the app
  distDir: '.next',
  // Configure the build output
  output: 'standalone',
  // Use both app and pages directories
  experimental: {
    appDir: true,
  },
  // Handle any image loading
  images: {
    domains: [],
    unoptimized: true,
  },
};

export default MillionLint.next({
  rsc: true,
  // Optimize components in the app directory
  filter: {
    include: [
      "**/src/components/*.{tsx,jsx}",
      "**/src/app/**/*.{tsx,jsx}",
      "**/pages/**/*.{js,jsx,ts,tsx}"
    ]
  }
})(nextConfig);
