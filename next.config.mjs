/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Add trailing slash to handle URLs properly in static export
  trailingSlash: true,
  // Enable 404 pages in Next.js config
  // You can add a custom 404 page by creating a '404.js' in the 'pages' directory
  // For more details, refer to the Next.js documentation.
  images: {
    unoptimized: true,
  },
  // Disable any server-side features since we're using static export
  reactStrictMode: true,
};

export default nextConfig;
