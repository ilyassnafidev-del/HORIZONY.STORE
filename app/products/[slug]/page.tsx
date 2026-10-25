import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { siteConfig } from "@/lib/config";
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.color}`,
    description: p.description,
    alternates: { canonical: `/products/${slug}/` },
    openGraph: {
      title: p.name,
      description: p.description,
      images: [{ url: p.images[0], width: 1200, height: 1500 }],
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const sameCategory = products.filter(x => x.category === p.category && x.id !== p.id);
  const related = sameCategory.length ? sameCategory : products.filter(x => x.id !== p.id);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Shop",
        item: `${siteConfig.origin}/shop/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: p.category,
        item: `${siteConfig.origin}/collections/${p.category}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: p.name,
        item: `${siteConfig.origin}/products/${p.slug}/`,
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\u003c"),
        }}
      />
      <ProductDetail product={p} />
      {p.category === "accessories" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Product", name: p.name,
        description: p.description, image: p.images.map(image => `${siteConfig.origin}${image}`),
        sku: p.sku, color: p.color, material: "Silicone", brand: { "@type": "Brand", name: "HORIZONY" },
        offers: { "@type": "Offer", price: (p.price / 100).toFixed(2), priceCurrency: siteConfig.currency, url: `${siteConfig.origin}/products/${p.slug}/` },
      }).replace(/</g, "\\u003c") }} />}
      <section className="section related">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CONTINUE THE COLLECTION</span>
            <h2>In good company.</h2>
          </div>
        </div>
        <div className="product-grid">
          {related
            .slice(0, 4)
            .map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
        </div>
      </section>
    </>
  );
}
