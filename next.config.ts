import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.kronotrop.com.tr",
      },
    ],
  },
};

export default nextConfig;
