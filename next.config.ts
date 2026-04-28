import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'playgrounds-storage-public.runcomfy.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
