import Link from "next/link";
import { BagContents } from "@/components/store";
export const metadata = {
  title: "Your shopping bag",
  alternates: { canonical: "/cart/" },
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <section className="section cart-page">
      <span className="eyebrow">YOUR SELECTION / HORISONY</span>
      <h1>The bag.</h1>
      <BagContents />
      <Link className="text-link" href="/shop">
        Continue exploring
      </Link>
    </section>
  );
}
