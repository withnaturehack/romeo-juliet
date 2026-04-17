import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app",
    "*.pike.replit.dev",
    "*.janeway.replit.dev",
    "*.kirk.replit.dev",
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
