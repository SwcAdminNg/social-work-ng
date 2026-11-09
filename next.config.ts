import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 keeps the site's photographs crisp; 75 stays the default elsewhere.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ba1e951cf7c545af846050a6519d5f4f.r2.dev",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
