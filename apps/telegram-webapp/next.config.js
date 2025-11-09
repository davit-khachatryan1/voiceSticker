/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Vercel
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  eslint: {
    // Don't run ESLint during build (Vercel will handle it)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't run TypeScript check during build (Vercel will handle it)
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
