import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
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
