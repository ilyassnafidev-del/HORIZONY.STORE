import type { NextConfig } from "next";
const config: NextConfig = {
  output: process.env.HORISONY_OUTPUT === "export" ? "export" : undefined,
  trailingSlash: true,
  devIndicators: false,
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [400, 800, 1200],
    imageSizes: [400, 800, 1200],
  },
  poweredByHeader: false,
};
export default config;
