/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['leaflet'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
