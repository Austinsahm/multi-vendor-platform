import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "dqxhmdrtddfbpnbjtren.supabase.co",
        protocol: "https"
      }
    ]
  }
};

export default nextConfig;
