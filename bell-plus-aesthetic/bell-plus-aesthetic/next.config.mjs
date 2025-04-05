import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Disable image optimization since we're exporting a static site
  images: {
    unoptimized: true,
  },
  // Explicitly set the app and pages directories
  experimental: {
    appDir: true,
  },
};

export default MillionLint.next({
  rsc: true,
  // Optimize components in the app directory
  filter: {
    include: [
      "**/src/app/**/*.{tsx,jsx}",
      "**/src/components/**/*.{tsx,jsx}"
    ]
  }
})(nextConfig);
