import { notFound } from "next/navigation";
import { Shop } from "@/components/shop";
export function generateStaticParams() {
  return [{ category: "t-shirts" }, { category: "jackets" }, { category: "accessories" }];
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return {
    title:
      category === "t-shirts"
        ? "T-Shirts — Refined essentials"
        : category === "accessories" ? "Accessories — The finishing touch" : "Jackets — Layers with purpose",
    description: category === "accessories" ? "Discover HORIZONY accessories, including the Essential Wristband in black silicone with white branding." : `Discover the HORISONY ${category} collection. Ten original pieces with considered shapes and details.`,
    alternates: { canonical: `/collections/${category}/` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (category !== "t-shirts" && category !== "jackets" && category !== "accessories") notFound();
  return <Shop category={category} />;
}
