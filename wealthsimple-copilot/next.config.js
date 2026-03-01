/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Allow larger CSV uploads
    },
  },
};

module.exports = nextConfig;
