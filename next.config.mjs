import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
