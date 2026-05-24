import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const legacyOrigin =
  process.env.WCS_LEGACY_SITE_URL?.replace(/\/$/, "") ?? "https://worldclassscholars.vercel.app";

/** Vue SPA routes still served from the official site until ported into Next.js */
const legacySpaRoutes = [
  "library",
  "courses",
  "future-lab",
  "art-verse",
  "podcasts",
  "digital-marketing",
  "digital-advertising",
  "contact",
  "my-courses",
  "api-status",
  "resources",
  "admin",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: root,
  async rewrites() {
    const spaRewrites = legacySpaRoutes.flatMap((route) => [
      { source: `/${route}`, destination: `${legacyOrigin}/${route}` },
      { source: `/${route}/:path*`, destination: `${legacyOrigin}/${route}/:path*` },
    ]);

    return [
      ...spaRewrites,
      { source: "/assets/:path*", destination: `${legacyOrigin}/assets/:path*` },
      { source: "/api/v1/:path*", destination: `${legacyOrigin}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;
