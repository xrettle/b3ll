import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Do NOT use export output mode for Netlify
  // output: 'export',
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

export default MillionLint.next({
  rsc: true,
  // Optimize components
  filter: {
    include: [
      "**/src/components/*.{tsx,jsx}",
      "**/src/app/**/*.{tsx,jsx}",
      "**/app/**/*.{tsx,jsx}",
      "**/pages/**/*.{js,jsx,ts,tsx}"
    ]
  }
})(nextConfig);
