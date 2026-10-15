export const siteConfig = {
  name: "HORISONY",
  currency: "USD",
  locale: "en-US",
  origin: "https://horizony.store",
  announcement: "A new perspective on the everyday. Explore Collection 01.",
  supportEmail: null as string | null,
  businessName: null as string | null,
  businessAddress: null as string | null,
  shippingRegions: [] as string[],
  returnWindowDays: null as number | null,
  checkoutEnabled: false,
};
export const money = (cents: number) =>
  new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
