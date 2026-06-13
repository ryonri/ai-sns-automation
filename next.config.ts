import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://click-design.vercel.app https://mob-online.com https://*.mob-online.com https://*.vercel.app",
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/auth", destination: "/", permanent: false },
      { source: "/auth/:path*", destination: "/", permanent: false },
      { source: "/signin", destination: "/", permanent: false },
      { source: "/signin/:path*", destination: "/", permanent: false },
      { source: "/register", destination: "/", permanent: false },
      { source: "/register/:path*", destination: "/", permanent: false },
      { source: "/callback", destination: "/", permanent: false },
      { source: "/callback/:path*", destination: "/", permanent: false },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
