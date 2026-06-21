/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  webpack: (config) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
};

module.exports = nextConfig;
