import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  serverExternalPackages: [
    "unified",
    "remark-parse",
    "remark-gfm",
    "remark-rehype",
    "rehype-raw",
    "rehype-stringify",
    "gray-matter",
    "@libsql/client",
  ],
};

export default nextConfig;
