import { notFound } from "next/navigation";
import { Shop } from "@/components/shop";
export function generateStaticParams() {
  return [{ category: "t-shirts" }, { category: "jackets" }];
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
        : "Jackets — Layers with purpose",
    description: `Discover the HORISONY ${category} collection. Ten original pieces with considered shapes and details.`,
    alternates: { canonical: `/collections/${category}/` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (category !== "t-shirts" && category !== "jackets") notFound();
  return <Shop category={category} />;
}
