import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/api/v1/internal/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CHAT_API_URL || "https://chat-backend-kr.vercel.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "x-internal-api-key, Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.CHAT_API_URL || "https://chat-backend-kr.vercel.app"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;