/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.thdstatic.com',
        port: '',
        pathname: '/**', // Allow any path on this hostname
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent @supabase/node-fetch from being bundled on the client-side
      config.resolve.alias = {
        ...config.resolve.alias,
        '@supabase/node-fetch': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
