import { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack is disabled
  },
  // Explicitly use webpack instead
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
