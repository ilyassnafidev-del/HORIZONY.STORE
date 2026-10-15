import { Shop } from "@/components/shop";
export const metadata = {
  title: "Shop the collection",
  description:
    "Explore all twenty HORISONY T-shirts and jackets. Filter by size, color and price.",
  alternates: { canonical: "/shop/" },
};
export default function Page() {
  return <Shop />;
}
