import Link from "next/link";
import Image from "next/image";
import { QuickAdd } from "./quick-add";
import type { Product } from "@/lib/catalog";
import { money } from "@/lib/config";
export function ProductCard({
  product: p,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  return (
    <article className="product-card">
      <div className="card-image">
        <Link href={`/products/${p.slug}`}>
          <span className="card-index">
            {String(index + 1).padStart(2, "0")} / HORISONY
          </span>
          <Image
            src={p.images[0]}
            alt={`${p.name} in ${p.color}, front view`}
            width={800}
            height={1000}
            sizes="(max-width:640px) 50vw,(max-width:1000px) 33vw,25vw"
          />
        </Link>
        <QuickAdd product={p} />
      </div>
      <div className="card-title">
        <Link href={`/products/${p.slug}`}>{p.name}</Link>
        <span>{money(p.price)}</span>
      </div>
      <div className="card-color">
        <span style={{ background: p.hex }} />
        {p.color}
      </div>
    </article>
  );
}
