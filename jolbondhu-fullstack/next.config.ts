import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["tile.openstreetmap.org"],
  },
  // এই লাইন যোগ করুন
  transpilePackages: ["react-leaflet"],
};

export default nextConfig;
