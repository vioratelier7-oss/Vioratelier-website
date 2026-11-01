import type { NextConfig } from "next";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // A separate distDir lets two dev servers run side by side (e.g. NEXT_DIST_DIR=.next-admin).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  images: {
    // Set NEXT_PUBLIC_IMAGE_UNOPTIMIZED=1 only for a static design-preview export.
    unoptimized: process.env.NEXT_PUBLIC_IMAGE_UNOPTIMIZED === "1",
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseUrl
      ? [{ protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https", hostname: supabaseUrl.hostname, port: supabaseUrl.port, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
