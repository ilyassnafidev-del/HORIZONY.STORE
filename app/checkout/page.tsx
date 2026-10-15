import { Checkout } from "@/components/checkout";
export const metadata = {
  title: "Checkout preview",
  description:
    "Preview the HORISONY checkout experience. Card payments and order processing are not yet active.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/checkout/" },
};
export default function Page() {
  return <Checkout />;
}
