import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure the build output
  output: 'export',
  // Handle any image loading
  images: {
    unoptimized: true,
  },
};

export default MillionLint.next({
  rsc: true,
  // Optimize components in the app directory
  filter: {
    include: [
      "**/src/components/*.{tsx,jsx}",
      "**/src/app/**/*.{tsx,jsx}"
    ]
  }
})(nextConfig);
