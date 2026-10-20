import { deliveryInformation } from "./config";
import { refundPolicy } from "./refund-policy";

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
  "privacy-policy": {
    title: "Privacy Policy",
    description: "How HORIZONY and NAFI LLC handle storefront information, browser storage and privacy requests.",
    sections: [
      {
        id: "business", title: "1. Who is responsible for this website",
        paragraphs: ["HORIZONY at https://horizony.store is operated by NAFI LLC, registered in New Mexico, USA, with the business address 8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA. This policy describes the current storefront, including its inactive checkout preview. Customer support and privacy requests are handled solely through the official WhatsApp contact below."],
      },
      {
        id: "information", title: "2. Information used by the current storefront",
        paragraphs: ["Your shopping bag stores product identifiers, selected sizes and quantities in your browser's local storage under horisony-bag-v1. This lets your selection remain available when you return using the same browser. The bag does not store your name, delivery address or payment information.", "The checkout preview lets you type your first and last name, email, phone number, country and delivery address. These values stay in the page's temporary memory for form validation. The storefront does not submit them, save them to a customer database or create an order. Reloading or leaving that page clears the page's form state.", "Visiting a hosted website necessarily sends network requests to the hosting service. Operational information may include an IP address, requested URL, time, browser information and error or security details. Hostinger's actual logging configuration, access arrangements and retention periods require confirmation."],
      },
      {
        id: "purposes", title: "3. Why information is used",
        paragraphs: ["Browser storage is used to maintain your bag. Temporary checkout values are used only to demonstrate field validation. Hosting infrastructure processes requests to deliver the website and may process operational data to maintain availability and security.", "When you contact us through WhatsApp, we use the information you provide to answer your request, handle returns or cancellations, and respond to privacy requests. Your number, profile information and message content may be available to us through that conversation. Do not send payment card details or unnecessary sensitive information."],
      },
      {
        id: "orders-payments", title: "4. Future orders and payment-related information",
        paragraphs: ["No payments or orders are processed by the current storefront, and it contains no payment card fields. NAFI LLC does not receive full card numbers or card security codes through this preview.", "Before paid checkout is enabled, this policy must identify the actual authorized third-party payment provider and explain its role. A live order system would need customer and delivery details, purchased items, order amounts and relevant payment status or transaction references to take payment, fulfill orders and handle refunds. Those future data flows are not implemented here and must be disclosed accurately before launch. Purchases are intended to be one-time purchases rather than subscriptions."],
      },
      {
        id: "cookies", title: "5. Cookies, local storage and analytics",
        paragraphs: ["The storefront code does not set advertising or analytics cookies and does not integrate an analytics service, advertising tracker or newsletter collection service. Shopping bag persistence uses local storage rather than a cookie. Hosting-level services may have separate behavior that must be checked before this policy is finalized.", "You can remove items from the bag or clear this site's stored data in your browser settings. Clearing local storage resets the bag. A future analytics or marketing integration must be disclosed, with any consent or preference controls required for its actual use."],
      },
      {
        id: "providers-transfers", title: "6. Service providers and international processing",
        paragraphs: ["Hostinger is the intended production hosting provider. WhatsApp is the external service used for customer support. Opening our support link takes you to WhatsApp; its service and privacy terms also apply to your use of that platform. The storefront currently has no integrated payment, fulfillment, marketing or analytics processor. Production hosting arrangements still require review.", "Depending on where a provider operates, request or support information may be processed outside your country. The actual locations and any safeguards required by applicable privacy law must be established before a live order system or additional providers are introduced. This draft makes no claim that unverified transfer agreements are in place."],
        links: [{ href: "https://www.whatsapp.com/legal/privacy-policy", label: "WhatsApp Privacy Policy" }],
      },
      {
        id: "security-retention", title: "7. Security and retention",
        paragraphs: ["Checkout values exist only in the current page's memory; bag selections remain in your browser until removed or cleared. No order database or merchant-side payment data retention is implemented in this storefront.", "Operational log and future support or order retention periods require confirmation. Records should be retained only for their stated purposes and any applicable legal obligations. No method of transmission or storage is completely secure; do not enter payment card details into the preview or send them in a support request."],
      },
      {
        id: "rights", title: "8. Access, correction, deletion and other rights",
        paragraphs: ["Depending on the law that applies to you and the processing concerned, you may have rights to access, correct or delete personal information, receive a copy, object to certain uses or restrict processing. Some laws also allow withdrawal of consent or a complaint to a privacy authority. These rights can be subject to legal exceptions and proportionate identity checks.", "You can directly edit or clear information held only in your own browser. For access, correction, deletion or other privacy requests concerning information held by HORIZONY, contact us through the official WhatsApp link below and describe your request. Applicable legal requirements and exceptions govern the handling of your request."],
      },
      {
        id: "updates-contact", title: "9. Updates and contact",
        paragraphs: ["This policy must be reviewed before enabling payments or changing data practices. Material changes should be explained through an appropriate notice, and the last-updated date should reflect the policy actually published.", "NAFI LLC's business address is 8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA. WhatsApp is our sole channel for customer support and privacy requests. Use the official number and link below."],
        links: [{ href: "/refund-policy", label: "Refund & Cancellation Policy" }, { href: "/terms-of-service", label: "Terms of Service" }],
      },
    ],
  },
  "terms-of-service": {
    title: "Terms of Service",
    description: "Website, product, purchase and delivery terms for HORIZONY, operated by NAFI LLC in New Mexico, USA.",
    sections: [
      {
        id: "identity", title: "1. About HORIZONY",
        paragraphs: ["HORIZONY is an online fashion, clothing and apparel storefront at https://horizony.store, operated by NAFI LLC, registered in New Mexico, USA. Its business address is 8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA.", "The current website is a catalog and checkout preview. It cannot accept payments, create orders or reserve stock. The intended purchase model is one-time purchases, without subscriptions or recurring billing. These draft terms must be completed before selling begins."],
      },
      {
        id: "listings-prices", title: "2. Product listings, availability and prices",
        paragraphs: ["The catalog displays clothing designs, images, size options and prices in US dollars (USD). Images and screen colors may differ from the appearance of a physical item. The current catalog is identified as an example catalog; displayed products and sizes do not guarantee stock or a confirmed delivery date.", "The bag shows the merchandise subtotal for selected items. Shipping and tax are not yet configured, so that subtotal is not a payable final total. Any live checkout must disclose the applicable shipping, tax and total charge before payment authorization. A pricing or listing error must be resolved transparently before an order is accepted."],
      },
      {
        id: "checkout-acceptance", title: "3. Checkout, payment and order acceptance",
        paragraphs: ["Adding an item to the bag or using Check Details does not place an order or form a contract to buy goods. The payment control is disabled. Do not send a payment outside the website in reliance on this preview.", "Before sales open, these terms must explain the actual payment provider, authorization process, order acknowledgment and the point at which NAFI LLC accepts an order. No payment provider is currently integrated. Stock checks, payment failure handling, cancellation of unavailable items and any release or refund of a charge must match the implemented order process."],
      },
      {
        id: "delivery", title: "4. Shipping, delivery and tracking",
        paragraphs: [deliveryInformation.processing, deliveryInformation.shipping, "The list of countries in the preview form demonstrates address validation and is not a list of supported shipping destinations. Shipping regions, costs, customs arrangements and tracking services have not been confirmed.", "Before accepting orders, the business must publish the complete delivery terms and disclose applicable charges at checkout. If a live order cannot be shipped within a promised period, the customer must receive the notices, cancellation options and refunds required by applicable law. Checkout remains a preview and cannot accept orders."],
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
        paragraphs: ["The Privacy Policy explains the current storefront's browser storage, temporary checkout form and WhatsApp support channel. Changes to ordering, payments or data use require an appropriate update to the relevant policies before those features are enabled.", "Business: NAFI LLC, 8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA. Website: https://horizony.store. Customer support is available solely through the official WhatsApp number and link below."],
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
