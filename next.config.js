/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? '/seplag-untamed-quiz' : '',
  assetPrefix: isProd ? '/seplag-untamed-quiz/' : '',
};

module.exports = nextConfig;
