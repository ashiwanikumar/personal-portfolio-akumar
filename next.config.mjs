/** @type {import('next').NextConfig} */
import nextEnv from "@next/env";
import path from "node:path";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(path.resolve(process.cwd(), ".."));

const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/client-dashboard",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/client-dashbaord",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path((?!_next/static|_next/image|favicon).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://ashiwanikumar.com" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, s-maxage=31536000, immutable" },
        ],
      },
      {
        source: "/img/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
