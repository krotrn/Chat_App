import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    reactCompiler: true,
  },
  async headers() {
    return [
      {
        source: "/api/v1/internal/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CHAT_API_URL || "http://localhost:3001",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "x-internal-api-key, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;