"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ArrowRight } from "lucide-react";
import { products, quantityLimit, type Size } from "@/lib/catalog";
import { money } from "@/lib/config";
import { normalizeCart, cartSubtotal, type CartLine } from "@/lib/cart";
type Store = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string, size: Size, quantity: number, openBag?: boolean) => void;
  update: (id: string, size: Size, quantity: number) => void;
  ready: boolean;
};
const StoreContext = createContext<Store | null>(null);
export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}
export function Modal({
  children,
  onClose,
  label,
  side = false,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  side?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      old?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={side ? "drawer" : "modal"}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          className="icon close"
          aria-label={`Close ${label}`}
          onClick={onClose}
        >
          <X size={22} />
        </button>
        {children}
      </div>
    </div>
  );
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("horisony-bag-v1") || "[]");
      /* eslint-disable react-hooks/set-state-in-effect -- restore persisted browser state after hydration */ setLines(
        normalizeCart(data, products),
      );
    } catch {}
    setReady(true); /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("horisony-bag-v1", JSON.stringify(lines));
      } catch {}
  }, [lines, ready]);
  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === "horisony-bag-v1")
        try {
          setLines(normalizeCart(JSON.parse(e.newValue || "[]"), products));
        } catch {}
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  const update = (id: string, size: Size, quantity: number) =>
    setLines((current) =>
      normalizeCart(
        quantity <= 0
          ? current.filter((l) => !(l.productId === id && l.size === size))
          : current.map((l) =>
              l.productId === id && l.size === size ? { ...l, quantity } : l,
            ),
        products,
      ),
    );
  const add = (id: string, size: Size, quantity: number, openBag = true) => {
    setLines((current) =>
      normalizeCart([...current, { productId: id, size, quantity }], products),
    );
    setOpen(openBag);
  };
  const close = useCallback(() => setOpen(false), []);
  return (
    <StoreContext.Provider
      value={{
        lines,
        ready,
        open,
        setOpen,
        add,
        update,
        count: lines.reduce((n, l) => n + l.quantity, 0),
        subtotal: cartSubtotal(lines, products),
      }}
    >
      {children}
      {open && (
        <Modal label="Shopping bag" onClose={close} side>
          <span className="eyebrow">YOUR SELECTION</span>
          <h2 className="drawer-title">The bag.</h2>
          <BagContents drawer />
        </Modal>
      )}
    </StoreContext.Provider>
  );
}
export function BagContents({
  drawer = false,
  summary = false,
}: {
  drawer?: boolean;
  summary?: boolean;
}) {
  const { lines, update, subtotal, setOpen, ready } = useStore();
  if (!ready) return <p role="status">Loading your bag…</p>;
  if (!lines.length)
    return (
      <div className="empty">
        <p>Your next everyday essential awaits.</p>
        <Link
          className="button dark"
          href="/shop"
          onClick={() => setOpen(false)}
        >
          EXPLORE THE COLLECTION <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <>
      <div className="bag-lines">
        {lines.map((line) => {
          const p = products.find((p) => p.id === line.productId)!;
          return (
            <article className="bag-line" key={`${p.id}-${line.size}`}>
              <Link
                href={`/products/${p.slug}`}
                onClick={() => setOpen(false)}
                className="bag-image"
              >
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  width={400}
                  height={500}
                  sizes="120px"
                />
              </Link>
              <div className="bag-info">
                <Link
                  href={`/products/${p.slug}`}
                  onClick={() => setOpen(false)}
                >
                  {p.name}
                </Link>
                <p className="muted">
                  {p.color} / Size {line.size}
                </p>
                {summary ? (
                  <p>Quantity {line.quantity}</p>
                ) : (
                  <>
                    <div className="quantity">
                      <button
                        aria-label={`Decrease ${p.name} size ${line.size} quantity`}
                        onClick={() =>
                          update(p.id, line.size, line.quantity - 1)
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        disabled={
                          line.quantity >= quantityLimit(p, line.size)
                        }
                        aria-label={`Increase ${p.name} size ${line.size} quantity`}
                        onClick={() =>
                          update(p.id, line.size, line.quantity + 1)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className="text-link remove"
                      onClick={() => update(p.id, line.size, 0)}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <span>{money(p.price * line.quantity)}</span>
            </article>
          );
        })}
      </div>
      <div className="bag-total">
        <p>
          <span>Subtotal</span>
          <strong>{money(subtotal)}</strong>
        </p>
        <p className="muted">
          Delivery and taxes await configuration. Final total unavailable.
        </p>
        {!summary && (
          <>
            <Link
              className="button dark"
              href="/checkout"
              onClick={() => setOpen(false)}
            >
              CONTINUE TO CHECKOUT <ArrowRight size={17} />
            </Link>
            <p className="note">Checkout preview · Payments coming soon</p>
            {drawer && (
              <Link
                className="text-link"
                href="/cart"
                onClick={() => setOpen(false)}
              >
                View your bag
              </Link>
            )}
          </>
        )}
      </div>
    </>
  );
}
