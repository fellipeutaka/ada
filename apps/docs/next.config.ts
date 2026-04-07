import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["docs.ada.localhost"],
  devIndicators: false,
};

const withMDX = createMDX();

export default withMDX(config);
