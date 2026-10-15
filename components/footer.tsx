import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link href="/" className="wordmark">
            HORISONY
            <span className="logo-dot" />
          </Link>
          <p>
            Considered clothing.
            <br />
            An everyday perspective.
          </p>
        </div>
        <div>
          <span className="eyebrow">THE COLLECTION</span>
          <Link href="/shop">
            All pieces <ArrowUpRight size={13} />
          </Link>
          <Link href="/collections/t-shirts">T-Shirts</Link>
          <Link href="/collections/jackets">Jackets</Link>
        </div>
        <div>
          <span className="eyebrow">THE STUDIO</span>
          <Link href="/about">About HORISONY</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <span className="eyebrow">INFORMATION</span>
          <Link href="/shipping">Shipping</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} HORISONY</span>
        <span>Collection 01 · A considered beginning</span>
        <span>Storefront preview · Example catalog</span>
      </div>
    </footer>
  );
}
