import Link from "next/link";
import { policyPublication, type Policy } from "@/lib/policies";
import { SupportContact } from "./support-contact";

export function PolicyPage({ policy }: { policy: Policy }) {
  const ready = policy.ready ?? policyPublication.ready;
  return (
    <article className="section information-page policy-page" aria-labelledby="policy-title">
      <span className="eyebrow">HORIZONY / CUSTOMER INFORMATION</span>
      <h1 id="policy-title">{policy.title}</h1>
      <p className="info-intro">{policy.description}</p>
      <p className="policy-updated">
        Last updated: <time dateTime={policy.updated ?? policyPublication.updated}>{policy.updatedLabel ?? policyPublication.updatedLabel}</time>
      </p>
      {!ready && (
        <aside className="policy-review" aria-label="Draft status">
          <strong>Draft for business review</strong>
          <p>Some operating terms are awaiting confirmation. This draft is not the final customer policy. Checkout remains unavailable.</p>
        </aside>
      )}
      <nav className="policy-contents" aria-label={`${policy.title} contents`}>
        <h2>On this page</h2>
        <ol>
          {policy.sections.map((section) => (
            <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\. /, "")}</a></li>
          ))}
        </ol>
      </nav>
      <div className="info-sections">
        {policy.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {["contact", "updates-contact", "privacy-contact"].includes(section.id) && <p>
              <SupportContact />
            </p>}
            {section.links && <div className="policy-links">{section.links.map((link) => (
              <Link key={link.href} href={link.href}>{link.label} ↗</Link>
            ))}</div>}
          </section>
        ))}
      </div>
      <Link className="text-link" href="/shop">Explore the collection ↗</Link>
    </article>
  );
}
