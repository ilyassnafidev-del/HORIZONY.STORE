"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { Product, Size } from "@/lib/catalog";
import { sizes } from "@/lib/catalog";
import { money } from "@/lib/config";
import { Modal, useStore } from "./store";
export function QuickAdd({ product: p }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<Size | null>(null);
  const [error, setError] = useState("");
  const { add } = useStore();
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        className="card-cta"
        aria-label={`Quick add ${p.name}`}
        onClick={() => {
          setSize(null);
          setError("");
          setOpen(true);
        }}
      >
        QUICK ADD <ArrowUpRight size={16} />
      </button>
      {open && (
        <Modal label={`Quick view ${p.name}`} onClose={close}>
          <div className="quick-view">
            <Image
              src={p.images[0]}
              alt={`${p.name}, ${p.color}`}
              width={400}
              height={500}
              sizes="(max-width:600px) 85vw,300px"
            />
            <div>
              <span className="eyebrow">HORISONY / COLLECTION 01</span>
              <h2>{p.name}</h2>
              <p>
                {money(p.price)} · {p.color}
              </p>
              <p className="note">{p.fit}</p>
              <span className="eyebrow">SELECT SIZE</span>
              <div className="size-options">
                {sizes.map((s) => (
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
              <button
                className="button dark"
                onClick={() => {
                  if (!size) {
                    setError("Choose a size before adding to your bag.");
                    return;
                  }
                  setOpen(false);
                  add(p.id, size, 1);
                }}
              >
                ADD TO BAG <ArrowRight size={16} />
              </button>
              <Link
                className="text-link"
                href={`/products/${p.slug}`}
                onClick={close}
              >
                View details & size guide
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
