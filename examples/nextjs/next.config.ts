import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  allowedDevOrigins: ["next.ada.localhost"],
};

export default nextConfig;
