import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section empty">
      <span className="eyebrow">404 / A DIFFERENT DIRECTION</span>
      <h1>A little off course.</h1>
      <p>This page is outside the collection.</p>
      <Link className="button dark" href="/shop">
        BACK TO THE COLLECTION
      </Link>
    </section>
  );
}
