import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";
import { policies, policyPublication } from "@/lib/policies";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/shop",
    "/collections/t-shirts",
    "/collections/jackets",
    "/about",
    "/contact",
    "/shipping",
    ...Object.entries(policies).filter(([, policy]) => policy.ready ?? policyPublication.ready).map(([slug]) => `/${slug}`),
    ...products.map((p) => `/products/${p.slug}`),
  ].map((path) => ({
    url: `${siteConfig.origin}${path.endsWith('/') ? path : `${path}/`}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path.startsWith("/products") ? 0.8 : 0.6,
  }));
}
