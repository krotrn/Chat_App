import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  async headers() {
    return [
      {
        source: "/api/v1/internal/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NEXT_PUBLIC_CHAT_API_URL ||
              "https://chatapp-backend-8wl9.onrender.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "POST, OPTIONS",
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
};
export default nextConfig;
