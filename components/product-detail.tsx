"use client";
import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  ArrowRight,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { sizes, productSizes, quantityLimit, categoryNames, type Size, type Product } from "@/lib/catalog";
import { money, deliveryInformation } from "@/lib/config";
import { useStore, Modal } from "./store";
export function ProductDetail({ product: p }: { product: Product }) {
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [magnified, setMagnified] = useState(false);
  const [guide, setGuide] = useState(false);
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const { add } = useStore();
  const router = useRouter();
  const measurements = p.measurements;
  const touch = useRef<number | null>(null);
  const closeZoom = useCallback(() => setZoom(false), []);
  const closeGuide = useCallback(() => setGuide(false), []);
  const names = ["Front", "Back", "Detail"];
  const change = (offset: number) =>
    setView((current) => (current + offset + 3) % 3);
  return (
    <>
      <div className="breadcrumbs">
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <Link href={`/collections/${p.category}`}>
          {categoryNames[p.category]}
        </Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <section className="product-detail">
        <div className="gallery">
          <div
            className="main-image"
            tabIndex={0}
            role="region"
            aria-label={`${p.name} gallery. Use left and right arrow keys to change image.`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                change(1);
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                change(-1);
              }
            }}
            onTouchStart={(e) => {
              touch.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touch.current !== null) {
                const delta = e.changedTouches[0].clientX - touch.current;
                if (Math.abs(delta) > 45) change(delta < 0 ? 1 : -1);
                touch.current = null;
              }
            }}
          >
            <Image
              priority
              src={p.images[view]}
              alt={`${p.name} in ${p.color}, ${names[view].toLowerCase()} view`}
              width={1200}
              height={1500}
              sizes="(max-width:800px) 100vw,55vw"
            />
            <span className="gallery-label">
              {names[view].toUpperCase()} / 0{view + 1}
            </span>
            <button
              className="icon zoom-button"
              aria-label="Enlarge product image"
              onClick={() => setZoom(true)}
            >
              <ZoomIn size={21} />
            </button>
            <button
              className="icon prev-image"
              aria-label="Previous product image"
              onClick={() => change(-1)}
            >
              <ChevronLeft />
            </button>
            <button
              className="icon next-image"
              aria-label="Next product image"
              onClick={() => change(1)}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="thumbnails">
            {p.images.map((src, i) => (
              <button
                key={src}
                aria-label={`Show ${names[i].toLowerCase()} view`}
                aria-pressed={view === i}
                onClick={() => setView(i)}
              >
                <Image
                  src={src}
                  alt={`${names[i]} view of ${p.name}`}
                  width={160}
                  height={200}
                  sizes="100px"
                />
                <span>{names[i]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <span className="eyebrow">HORISONY / COLLECTION 01</span>
          <h1>{p.name}</h1>
          <p className="product-price">{money(p.price)}</p>
          <p className="product-description">{p.description}</p>
          <div className="color-select">
            <span>COLOR — {p.color.toUpperCase()}</span>
            <button
              className="color-swatch"
              style={{ background: p.hex }}
              aria-label={`${p.color}, only available color`}
              aria-pressed="true"
            >
              <Check
                size={16}
                color={
                  [
                    "Black",
                    "Matte Black",
                    "Graphite",
                    "Navy",
                    "Charcoal",
                    "Indigo",
                    "Forest Green",
                  ].includes(p.color)
                    ? "white"
                    : "#111"
                }
              />
            </button>
          </div>
          <div className="size-heading">
            <span>SELECT SIZE</span>
            {p.measurements && <button className="text-link" onClick={() => setGuide(true)}>
              Size guide
            </button>}
          </div>
          <div className="size-options" role="group" aria-label="Choose a size">
            {productSizes(p).map((s) => (
              <button
                key={s}
                aria-pressed={size === s}
                onClick={() => {
                  setSize(s);
                  setError("");
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="field-error" aria-live="polite">
            {error}
          </p>
          <div className="add-row">
            <div className="quantity">
              <button
                aria-label="Decrease quantity"
                disabled={quantity === 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= quantityLimit(p, size ?? productSizes(p)[0])}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="button dark"
              onClick={() => {
                if (!size) {
                  setError(
                    "Choose your size before adding this piece to your bag.",
                  );
                  return;
                }
                add(p.id, size, quantity);
              }}
            >
              ADD TO BAG <ArrowRight size={17} />
            </button>
          </div>
          {p.category === "accessories" && <button className="button outline" onClick={() => {
            if (!size) { setError("Choose your size before continuing to checkout."); return; }
            add(p.id, size, quantity, false);
            router.push("/checkout");
          }}>BUY NOW <ArrowRight size={17} /></button>}
          <p className="product-caption">
            {p.fit}{p.category !== "accessories" && " · All four sizes available in the example catalog."}
          </p>
          <div className="product-accordions">
            <details open>
              <summary>Details & composition</summary>
              <p>{p.material}</p>
              <p>
                {p.fit}. Color: {p.color}. SKU: {p.sku}.
              </p>
            </details>
            <details>
              <summary>Care instructions</summary>
              <p>{p.care}</p>
              {p.category !== "accessories" && <p>
                Example guidance; confirm against the final garment care label
                before sale.
              </p>}
            </details>
            <details>
              <summary>Shipping & returns</summary>
              <p>
                {p.category === "accessories" ? `${deliveryInformation.shipping} Return requests are accepted within 30 calendar days after delivery. Delivery destinations and rates are not yet configured; checkout remains a preview.` : "Delivery destinations, rates and return terms are being configured. Checkout is a preview."}
              </p>
              <Link className="text-link" href="/shipping">
                Shipping information
              </Link>
              <Link className="text-link" href="/returns">
                Returns information
              </Link>
            </details>
          </div>
          <p className="catalog-note">
            {p.category === "accessories" ? "Original product concept imagery. Checkout is currently a preview; no payment is taken." : "Original concept imagery. Product specifications, prices, sizing and inventory are initial example data, awaiting merchandise verification."}
          </p>
        </div>
      </section>
      {zoom && (
        <Modal
          label={`${p.name} enlarged ${names[view]} view`}
          onClose={closeZoom}
        >
          <button
            className="text-link zoom-toggle"
            aria-pressed={magnified}
            onClick={() => setMagnified((value) => !value)}
          >
            {magnified ? "Fit to view" : "Magnify image · 2×"}
          </button>
          <div className={`zoom-image${magnified ? " magnified" : ""}`}>
            <Image
              src={p.images[view]}
              alt={`${p.name}, ${names[view]} view enlarged`}
              width={1200}
              height={1500}
              sizes="(max-width:700px) 90vw,700px"
            />
          </div>
        </Modal>
      )}
      {guide && measurements && (
        <Modal label="Size guide" onClose={closeGuide}>
          <span className="eyebrow">FIND YOUR FORM</span>
          <h2>Size guide.</h2>
          <p>
            Garment measurements in centimeters, measured flat. Double the chest
            width for garment circumference.
          </p>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest width</th>
                <th>Body length</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s}>
                  <th>{s}</th>
                  <td>{measurements[s][0]}</td>
                  <td>{measurements[s][1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note">
            {p.fit}. Example measurements — verify against final merchandise. No
            medium size is offered in this initial collection.
          </p>
        </Modal>
      )}
    </>
  );
}
