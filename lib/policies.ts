import { deliveryInformation } from "./config";
import { refundPolicy } from "./refund-policy";
import { privacyPolicy } from "./privacy-policy";

// Privacy and Terms retain review status for unconfirmed operating terms.
// Each policy can independently override readiness after owner confirmation.
export const policyPublication = {
  ready: false,
  updated: "2026-10-20",
  updatedLabel: "October 20, 2026",
};

type PolicySection = {
  id: string;
  title: string;
  paragraphs: string[];
  links?: { href: string; label: string }[];
};
export type Policy = {
  title: string;
  description: string;
  ready?: boolean;
  updated?: string;
  updatedLabel?: string;
  sections: PolicySection[];
};

export const policies: Record<string, Policy> = {
  "refund-policy": refundPolicy,
  "privacy-policy": privacyPolicy,
  "terms-of-service": {
    title: "Terms of Service",
    description: "Website, product, purchase and delivery terms for HORIZONY, operated by NAFI LLC in New Mexico, USA.",
    sections: [
      {
        id: "identity", title: "1. About HORIZONY",
        paragraphs: ["HORIZONY is an online fashion, clothing and apparel storefront at https://horizony.store, operated by NAFI LLC, registered in New Mexico, USA. Its business address is 8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA.", "Purchases are one-time purchases, without subscriptions or recurring billing. Online checkout is available only when its payment and order services are enabled. Adding an item to a bag does not reserve stock or confirm payment."],
      },
      {
        id: "listings-prices", title: "2. Product listings, availability and prices",
        paragraphs: ["The catalog displays clothing designs, images, size options and prices in US dollars (USD). Images and screen colors may differ from the appearance of a physical item. The current catalog is identified as an example catalog; displayed products and sizes do not guarantee stock or a confirmed delivery date.", "The bag shows the merchandise subtotal. Shipping is displayed at checkout and the final amount is shown on Stripe for review before payment. Initial shipping rates are $0.00 for supported destinations; any later rate change is shown before a new order is submitted. A pricing or listing error must be resolved transparently before purchase."],
      },
      {
        id: "checkout-acceptance", title: "3. Checkout, payment and order acceptance",
        paragraphs: ["When online checkout is available, Proceed to Payment validates the shipping details and saves an unpaid order before opening Stripe. An unpaid order record is not confirmation of payment. If payment is canceled or abandoned, the order remains unpaid and can be retried through its order status page.", "Stripe handles payment credentials on its hosted checkout. Available payment methods depend on the device, country and Stripe settings. HORIZONY marks an order paid only after server-side verification with Stripe. A successful-payment browser return alone does not confirm payment. Customers can review their own orders using the browser session used at checkout."],
      },
      {
        id: "delivery", title: "4. Shipping, delivery and tracking",
        paragraphs: [deliveryInformation.processing, deliveryInformation.shipping, "The checkout country selector lists current supported destinations, including European destinations, the United States, Canada, Australia and the United Kingdom. Shipping charges are displayed before payment. The delivery window begins at shipment and excludes order processing.", "If an order cannot be shipped within a promised period, customers receive the notices, cancellation options and refunds required by applicable law. Contact customer support about delivery arrangements and delays."],
        links: [{ href: "/shipping", label: "Current shipping information" }],
      },
      {
        id: "returns", title: "5. Cancellations, returns and refunds",
        paragraphs: ["You may request a return within 30 calendar days after delivery. Change-of-mind returns require unused, unwashed and undamaged items, with original tags and packaging where reasonably possible. Request cancellation before shipment; after shipment, the normal return process applies.", "Approved return refunds are initiated to the original payment method within 5–10 business days after receipt and inspection, subject to any earlier deadline required by law. Customers pay change-of-mind return shipping unless applicable law requires otherwise; HORIZONY covers reasonable return-shipping costs for confirmed faults or errors attributable to HORIZONY. Exchanges use a return and a new order. Contact support for individual return instructions and an authorized destination. See the Refund & Cancellation Policy for full terms. Statutory rights remain unaffected."],
        links: [{ href: "/refund-policy", label: "Refund & Cancellation Policy" }],
      },
      {
        id: "responsibilities", title: "6. Your responsibilities",
        paragraphs: ["Use the website lawfully and provide accurate information when contacting the business. Do not attempt unauthorized access, introduce malicious code, interfere with other visitors or misuse another person's information. Any future purchase must be made by someone with legal capacity to enter the transaction and permission to use the selected payment method."],
      },
      {
        id: "intellectual-property", title: "7. Website content and intellectual property",
        paragraphs: ["Website text, branding, designs and images are protected by applicable intellectual property laws to the extent those laws apply. Rights belong to NAFI LLC or their respective rights holders. Browsing the website does not grant permission to reproduce or commercially exploit protected material, except as permitted by law or with the relevant rights holder's permission."],
      },
      {
        id: "liability", title: "8. Availability and responsibility",
        paragraphs: ["The business may maintain or update the website, and access may occasionally be interrupted. The preview is not a guarantee of future merchandise availability, uninterrupted access or a confirmed purchase service.", "Nothing in these terms excludes liability or remedies that cannot lawfully be excluded, including applicable mandatory consumer protections. Any further limitation of liability must be assessed against the actual sales service and applicable law before these draft terms are finalized; this draft imposes no additional liability cap."],
      },
      {
        id: "law-disputes", title: "9. Applicable law and resolving concerns",
        paragraphs: ["NAFI LLC is registered in New Mexico, USA. Proposed governing-law terms and any dispute procedure require business confirmation before publication. Nothing here limits mandatory rights under the laws applicable to a customer or requires arbitration, waives collective rights or restricts access to a court or consumer authority.", "Contact us through the official WhatsApp link below to raise a concern directly with the business. The registered business address is not a confirmed returns facility."],
      },
      {
        id: "privacy-contact", title: "10. Privacy, updates and contact",
        paragraphs: ["The Privacy Policy explains browser storage, customer sessions, saved orders, Stripe payment verification and WhatsApp support. Changes to ordering, payments or data use require an appropriate update to the relevant policies before those features are enabled.", "Business: NAFI LLC, 8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA. Website: https://horizony.store. Customer support is available solely through the official WhatsApp number and link below."],
        links: [{ href: "/privacy-policy", label: "Privacy Policy" }, { href: "/refund-policy", label: "Refund & Cancellation Policy" }],
      },
    ],
  },
};

export const policyAliases: Record<string, string> = {
  returns: "refund-policy",
  privacy: "privacy-policy",
  terms: "terms-of-service",
};
