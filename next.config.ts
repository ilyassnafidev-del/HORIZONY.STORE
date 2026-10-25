import type { NextConfig } from "next";
const config: NextConfig = {
  trailingSlash: true,
  devIndicators: false,
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [400, 800, 1200],
    imageSizes: [400, 800, 1200],
  },
  poweredByHeader: false,
  async headers(){return [
    {source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"X-Frame-Options",value:"DENY"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"}]},
    {source:"/admin/:path*",headers:[{key:"X-Robots-Tag",value:"noindex, nofollow"}]},
    {source:"/order-status/:path*",headers:[{key:"X-Robots-Tag",value:"noindex, nofollow"}]},
  ];},
};
export default config;
