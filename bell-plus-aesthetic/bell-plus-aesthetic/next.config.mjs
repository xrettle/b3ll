import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Disable image optimization since we're exporting a static site
  images: {
    unoptimized: true,
  },
};

export default MillionLint.next({
  rsc: true,
  // Optimize components in the app directory
  filter: {
    include: [
      "**/app/*.{tsx,jsx}",
      "**/components/*.{tsx,jsx}"
    ]
  }
})(nextConfig);
