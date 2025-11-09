/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Vercel
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
