import { notFound } from "next/navigation";
import Link from "next/link";
import { information } from "@/lib/information";
import { policies, policyAliases, policyPublication } from "@/lib/policies";
import { PolicyPage } from "@/components/policy-page";
import { SupportContact } from "@/components/support-contact";
export const dynamicParams = false;
export function generateStaticParams() {
  return [...Object.keys(information), ...Object.keys(policies)].map((info) => ({ info }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  const policySlug = policyAliases[info] ?? info;
  const policy = policies[policySlug];
  if (policy) return {
    title: { absolute: `${policy.title} | HORIZONY` },
    description: policy.description,
    alternates: { canonical: `/${policySlug}/` },
    robots: (policy.ready ?? policyPublication.ready) ? undefined : { index: false, follow: true },
  };
  const page = information[info];
  return {
    title: info[0]?.toUpperCase() + info.slice(1),
    description: page?.intro,
    alternates: { canonical: `/${info}/` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  const policy = policies[policyAliases[info] ?? info];
  if (policy) return <PolicyPage policy={policy} />;
  const page = information[info];
  if (!page) notFound();
  return (
    <section className="section information-page">
      <span className="eyebrow">{page.kicker}</span>
      <h1>{page.title}</h1>
      <p className="info-intro">{page.intro}</p>
      <div className="info-sections">
        {page.sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            {info === "contact" && s.title === "Customer support" && <p><SupportContact className="text-link" /></p>}
          </section>
        ))}
      </div>
      <Link className="text-link" href="/shop">
        Explore the collection ↗
      </Link>
    </section>
  );
}
