"use client";
import { useState, useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { products, sizes } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { Modal } from "./store";
import { money, siteConfig } from "@/lib/config";
export function Shop({ category }: { category?: "t-shirts" | "jackets" }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(category ?? "all");
  const [color, setColor] = useState("all");
  const [size, setSize] = useState("all");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState(false);
  const close = useCallback(() => setFilters(false), []);
  const base = products.filter((p) => !category || p.category === category);
  const results = base
    .filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (color === "all" || p.color === color) &&
        (size === "all" || p.inventory[size as keyof typeof p.inventory] > 0) &&
        (!min || p.price >= Number(min) * 100) &&
        (!max || p.price <= Number(max) * 100) &&
        `${p.name} ${p.color} ${p.material}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    )
    .sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : Number(b.id) - Number(a.id),
    );
  const reset = () => {
    setQuery("");
    setCat(category ?? "all");
    setColor("all");
    setSize("all");
    setMin("");
    setMax("");
    setSort("newest");
  };
  const controls = (
    <>
      <div className="filter-heading">
        <h2>Refine your selection</h2>
        <button className="text-link" onClick={reset}>
          Reset
        </button>
      </div>
      {!category && (
        <label>
          Category
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All pieces</option>
            <option value="t-shirts">T-Shirts</option>
            <option value="jackets">Jackets</option>
          </select>
        </label>
      )}
      <label>
        Color
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="all">All colors</option>
          {[...new Set(base.map((p) => p.color))].sort().map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Size
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="all">All sizes</option>
          {sizes.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <fieldset className="price-range">
        <legend>Price range ({siteConfig.currency})</legend>
        <div>
          <label>
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </label>
          <span>—</span>
          <label>
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </label>
        </div>
      </fieldset>
      {min && max && Number(min) > Number(max) && (
        <p className="field-error">
          Minimum price must be below maximum price.
        </p>
      )}
      <p className="note">
        Collection range: {money(Math.min(...base.map((p) => p.price)))}–
        {money(Math.max(...base.map((p) => p.price)))}
      </p>
    </>
  );
  return (
    <section className="section shop-section">
      <div className="shop-intro">
        <span className="eyebrow">
          COLLECTION 01 / {category ? "THE COLLECTION" : "ALL PIECES"}
        </span>
        <h1>
          {category === "t-shirts"
            ? "The everyday essential."
            : category === "jackets"
              ? "Layers with purpose."
              : "A considered collection."}
        </h1>
        <p>
          {category === "t-shirts"
            ? "Ten perspectives on a familiar form. Refined essentials for everyday expression."
            : category === "jackets"
              ? "Ten outer layers. Texture, shape and a point of view."
              : "Twenty pieces. Two collections. A new perspective on your everyday."}
        </p>
      </div>
      <div className="shop-toolbar">
        <button
          className="filter-toggle"
          onClick={() => setFilters(!filters)}
          aria-expanded={filters}
        >
          <SlidersHorizontal size={16} /> FILTERS{" "}
          {filters ? <X size={14} /> : null}
        </button>
        <label className="shop-search">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection"
          />
        </label>
        <span className="result-count" aria-live="polite">
          {results.length} PIECES
        </span>
        <label className="sort">
          <span className="sr-only">Sort products</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
      </div>
      {filters && (
        <>
          <aside className="filters desktop-filters">{controls}</aside>
          <div className="mobile-filters">
            <Modal label="Product filters" onClose={close} side>
              <div className="filters">
                {controls}
                <button className="button dark" onClick={close}>
                  SHOW {results.length} PIECES
                </button>
              </div>
            </Modal>
          </div>
        </>
      )}
      <div className="product-grid">
        {results.map((p, i) => (
          <ProductCard product={p} key={p.id} index={i} />
        ))}
      </div>
      {!results.length && (
        <div className="empty">
          <h2>A little more room to explore.</h2>
          <p>
            No pieces match your selection. Adjust your filters or start again.
          </p>
          <button className="button dark" onClick={reset}>
            CLEAR FILTERS
          </button>
        </div>
      )}
      <p className="catalog-note">
        Collection preview. Prices, materials, measurements and stock are
        editable example catalog data.
      </p>
    </section>
  );
}
