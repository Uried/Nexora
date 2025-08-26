import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '146.59.155.128',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
