import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "7d7f93b4-db65-4826-aeea-e455b689bc8b-00-1lrau9euq0jdb.pike.replit.dev",
    "*.replit.dev",
    "*.pike.replit.dev",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rwzqvixxujuiwnqfmnjf.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
