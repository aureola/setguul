import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    // On-the-fly optimization needs sharp (or a thread-hungry WASM
    // fallback without it), which crashes under this host's CloudLinux
    // LVE process/thread limits. Serve uploaded images unoptimized.
    unoptimized: true,
  },
  experimental: {
    // Shared cPanel hosting (CloudLinux LVE) limits processes per account;
    // the default worker count (cpu count - 1) exceeds that limit and
    // crashes the build with EAGAIN during page-data collection.
    cpus: 2,
  },
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
