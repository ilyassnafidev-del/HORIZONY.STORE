"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, ArrowUpRight } from "lucide-react";
import { useStore, Modal } from "./store";
import { products } from "@/lib/catalog";
import { money, siteConfig } from "@/lib/config";
export function Header() {
  const { count, setOpen } = useStore();
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const path = usePathname();
  const closeSearch = useCallback(() => setSearch(false), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const links = [
    ["Home", "/"],
    ["Shop", "/shop"],
    ["T-Shirts", "/collections/t-shirts"],
    ["Jackets", "/collections/jackets"],
    ["About", "/about"],
  ];
  return (
    <>
      <div className="announcement">
        {siteConfig.announcement}
        <ArrowUpRight size={12} />
      </div>
      <header className="header">
        <button
          className="icon mobile-only"
          aria-label="Open navigation"
          onClick={() => setMenu(true)}
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="wordmark" aria-label="HORISONY home">
          HORISONY
          <span className="logo-dot" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              className={path === href ? "active" : ""}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon"
            aria-label="Search products"
            onClick={() => setSearch(true)}
          >
            <Search size={20} />
          </button>
          <button
            className="bag-button"
            aria-label={`Open shopping bag, ${count} items`}
            onClick={() => setOpen(true)}
          >
            <ShoppingBag size={20} />
            <span className="bag-label">Bag</span>
            <span className="bag-count">{count}</span>
          </button>
        </div>
      </header>
      {menu && (
        <Modal label="Navigation" onClose={closeMenu} side>
          <span className="eyebrow">HORISONY / COLLECTION 01</span>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map(([name, href]) => (
              <Link href={href} key={href} onClick={closeMenu}>
                {name}
                <ArrowUpRight />
              </Link>
            ))}
          </nav>
        </Modal>
      )}
      {search && (
        <Modal label="Search products" onClose={closeSearch}>
          <span className="eyebrow">FIND YOUR NEXT ESSENTIAL</span>
          <h2>Search the collection.</h2>
          <label className="search-input">
            <Search size={20} />
            <input
              aria-label="Search collection"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try ‘bomber’, ‘cotton’ or ‘sage’"
            />
          </label>
          <div className="search-results">
            {(query
              ? products.filter((p) =>
                  `${p.name} ${p.color} ${p.material} ${p.category}`
                    .toLowerCase()
                    .includes(query.toLowerCase().trim()),
                )
              : products.filter((p) => p.featured).slice(0, 4)
            ).map((p) => (
              <Link
                href={`/products/${p.slug}`}
                key={p.id}
                onClick={closeSearch}
              >
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  width={80}
                  height={100}
                  sizes="80px"
                />
                <span>
                  {p.name}
                  <small>{p.color}</small>
                </span>
                <span>{money(p.price)}</span>
              </Link>
            ))}
            {query &&
              !products.some((p) =>
                `${p.name} ${p.color} ${p.material} ${p.category}`
                  .toLowerCase()
                  .includes(query.toLowerCase().trim()),
              ) && <p>No pieces match “{query}”. Try a color or category.</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
