import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, MoveDown } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span className="little-cross">✳</span> COLLECTION 01 — THE
            EVERYDAY, RECONSIDERED
          </div>
          <h1>
            THE SHAPE
            <br />
            OF WHAT’S
            <br />
            <span>NEXT.</span>
          </h1>
          <p>
            Contemporary essentials. Considered details.
            <br />
            Designed for your everyday.
          </p>
          <Link className="button dark" href="/shop">
            EXPLORE THE COLLECTION <ArrowUpRight size={18} />
          </Link>
          <Link className="hero-secondary text-link" href="/about">
            DISCOVER HORISONY <ArrowRight size={16} />
          </Link>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit" />
          <span className="hero-number">01</span>
          <Image
            priority
            src="/images/horizon-bomber-jacket-front.webp"
            alt="HORISONY Horizon Bomber Jacket, matte black studio packshot"
            width={1200}
            height={1500}
            sizes="(max-width:700px) 100vw,55vw"
          />
          <div className="hero-caption">
            <span>
              HORIZON BOMBER JACKET
              <br />
              <small>MATTE BLACK / CONSIDERED FORM</small>
            </span>
            <Link
              href="/products/horizon-bomber-jacket"
              aria-label="Discover Horizon Bomber Jacket"
            >
              <ArrowUpRight size={28} />
            </Link>
          </div>
        </div>
        <div className="hero-bottom">
          <span>FORM. TEXTURE. EVERYDAY.</span>
          <span>
            SCROLL TO DISCOVER <MoveDown size={13} />
          </span>
        </div>
      </section>
      <div className="principles">
        <span>CONSIDERED DESIGN</span>
        <span>MODERN SILHOUETTES</span>
        <span>EVERYDAY EXPRESSION</span>
        <span>HORISONY / COLLECTION 01</span>
      </div>
      <section className="section categories">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / THE COLLECTIONS</span>
            <h2>
              Two forms.
              <br />
              Endless possibility.
            </h2>
          </div>
          <p>
            Start with an essential.
            <br />
            Make it your own.
          </p>
        </div>
        <div className="category-grid">
          <Link href="/collections/t-shirts" className="category">
            <Image
              src="/images/horizon-essential-tee-front.webp"
              alt="Off-white Horizon Essential Tee"
              width={800}
              height={1000}
              sizes="(max-width:700px) 100vw,50vw"
            />
            <span className="category-count">10 CONSIDERED PIECES</span>
            <div>
              <span>
                <h3>T-SHIRTS</h3>
                <p>Refined essentials for everyday expression.</p>
              </span>
              <ArrowUpRight size={32} />
            </div>
          </Link>
          <Link href="/collections/jackets" className="category">
            <Image
              src="/images/studio-suede-effect-jacket-front.webp"
              alt="Taupe Studio Suede-Effect Jacket"
              width={800}
              height={1000}
              sizes="(max-width:700px) 100vw,50vw"
            />
            <span className="category-count">10 PURPOSEFUL LAYERS</span>
            <div>
              <span>
                <h3>JACKETS</h3>
                <p>Layers with purpose. Style without compromise.</p>
              </span>
              <ArrowUpRight size={32} />
            </div>
          </Link>
        </div>
      </section>
      <section className="section featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / THE EDIT</span>
            <h2>Everyday, elevated.</h2>
          </div>
          <Link className="text-link" href="/shop">
            VIEW ALL PIECES <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((p) => p.featured)
            .map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
        </div>
      </section>
      <section className="editorial">
        <div className="editorial-image">
          <Image
            src="/images/atlas-utility-jacket-detail.webp"
            alt="Considered construction and fabric details of the olive Atlas Utility Jacket"
            width={1200}
            height={1500}
            sizes="(max-width:700px) 100vw,50vw"
          />
          <span>ATLAS UTILITY / A STUDY IN DETAIL</span>
        </div>
        <div className="editorial-copy">
          <span className="eyebrow">03 / THE HORISONY PERSPECTIVE</span>
          <h2>
            LESS NOISE.
            <br />
            MORE
            <br />
            <em>CHARACTER.</em>
          </h2>
          <p>
            We see clothing as a space for personal expression. Considered
            shapes. Tactile surfaces. Details that give the familiar a fresh
            perspective.
          </p>
          <p>
            A wardrobe doesn’t need to say everything.
            <br />
            Just something that feels like you.
          </p>
          <Link className="button light" href="/about">
            DISCOVER HORISONY <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="closing">
        <span className="eyebrow">COLLECTION 01 / A CONSIDERED BEGINNING</span>
        <h2>Make room for what’s next.</h2>
        <Link className="text-link" href="/shop">
          EXPLORE THE COLLECTION <ArrowUpRight size={20} />
        </Link>
      </section>
    </>
  );
}
