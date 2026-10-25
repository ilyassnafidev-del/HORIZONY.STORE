import { Checkout } from "@/components/checkout";
export const metadata = {
  title: "Checkout",
  description:
    "Review your HORIZONY bag, delivery details and secure payment options.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/checkout/" },
};
export default function Page() {
  return <Checkout />;
}
