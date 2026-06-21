const isProd = process.env.NODE_ENV === 'production';
const repoName = 'seplag-untamed-quiz';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
};

module.exports = nextConfig;
