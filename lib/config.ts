export const siteConfig = {
  name: "HORISONY",
  currency: "USD",
  locale: "en-US",
  origin: "https://horizony.store",
  announcement: "A new perspective on the everyday. Explore Collection 01.",
  supportWhatsappNumber: "+1 (406) 608-6028",
  supportWhatsappUrl: "https://wa.me/14066086028",
  businessName: "NAFI LLC" as string | null,
  businessAddress: "8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA" as string | null,
  shippingRegions: [] as string[],
  deliveryEstimate: "3–7 business days",
  deliveryPeriodStarts: "the date the order is shipped",
  returnWindowDays: 30 as number | null,
  checkoutEnabled: false,
};
export const deliveryInformation = {
  shipping: `Shipping takes ${siteConfig.deliveryEstimate}, starting from ${siteConfig.deliveryPeriodStarts}. This shipping period does not include order processing time.`,
  processing: "Order processing takes place before shipment. The order processing timeframe has not yet been confirmed.",
};
export const money = (cents: number) =>
  new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
