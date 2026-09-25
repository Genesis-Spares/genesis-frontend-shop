import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    // Product images come from the catalog DB and can be hosted anywhere,
    // so allow any remote host. `unoptimized` avoids the optimizer needing
    // to reach each host in dev.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
