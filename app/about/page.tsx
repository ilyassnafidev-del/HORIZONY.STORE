import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
export const metadata = {
  title: "Our perspective",
  description:
    "The HORISONY perspective: considered design, modern silhouettes and everyday expression.",
  alternates: { canonical: "/about/" },
};
export default function Page() {
  return (
    <>
      <section className="section about-intro">
        <span className="eyebrow">THE STUDIO / OUR PERSPECTIVE</span>
        <h1>
          A quieter form
          <br />
          of expression.
        </h1>
        <div className="about-text">
          <span>FORM. TEXTURE. EVERYDAY.</span>
          <div>
            <p>
              HORISONY begins with a simple idea: everyday clothing can have a
              point of view.
            </p>
            <p>
              We explore the space between familiar and unexpected. A broader
              shoulder. A tactile surface. A seam placed with intention. Nothing
              needs to shout to leave an impression.
            </p>
            <p>
              Our first collection brings together twenty original concepts —
              ten T-shirts and ten jackets — built around modern silhouettes,
              considered details and the freedom to make them your own.
            </p>
          </div>
        </div>
      </section>
      <section className="about-image">
        <Image
          src="/images/studio-suede-effect-jacket-detail.webp"
          alt="Soft taupe surface and seam detail of the Studio Suede-Effect Jacket"
          width={1200}
          height={1500}
          sizes="100vw"
        />
        <span>THE DETAIL IS THE DIFFERENCE.</span>
      </section>
      <section className="section values-grid">
        {[
          [
            "01",
            "Considered design.",
            "Shape and detail, working together. Every element earns its place.",
          ],
          [
            "02",
            "Modern silhouettes.",
            "A fresh perspective on familiar forms. Room for movement and personal interpretation.",
          ],
          [
            "03",
            "Everyday expression.",
            "Pieces that begin with a clear idea and become part of your own.",
          ],
        ].map(([n, title, copy]) => (
          <div key={n}>
            <span className="eyebrow">{n}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
        ))}
      </section>
      <section className="closing">
        <h2>
          Your everyday.
          <br />A new perspective.
        </h2>
        <Link className="button dark" href="/shop">
          EXPLORE THE COLLECTION <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
