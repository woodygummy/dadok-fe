import type { NextConfig } from "next";

const backendOrigin =
  process.env.DADOK_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8787";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/login",
        destination: `${backendOrigin}/auth/login`,
      },
      {
        source: "/auth/register",
        destination: `${backendOrigin}/auth/register`,
      },
      {
        source: "/auth/me",
        destination: `${backendOrigin}/auth/me`,
      },
      {
        source: "/auth/nickname-available",
        destination: `${backendOrigin}/auth/nickname-available`,
      },
      {
        source: "/auth/:provider/start",
        destination: `${backendOrigin}/auth/:provider/start`,
      },
      {
        source: "/auth/:provider/callback",
        destination: `${backendOrigin}/auth/:provider/callback`,
      },
      {
        source: "/health",
        destination: `${backendOrigin}/health`,
      },
    ];
  },
};

export default nextConfig;
