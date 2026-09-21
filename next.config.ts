import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ioredis reaches for node internals that must not be traced into the bundle.
  serverExternalPackages: ["ioredis"],
};

export default nextConfig;
