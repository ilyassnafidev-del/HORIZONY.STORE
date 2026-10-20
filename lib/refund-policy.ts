import { siteConfig } from "./config";
import type { Policy } from "./policies";

export const refundPolicy: Policy = {
  title: "Refund & Cancellation Policy",
  description: "HORIZONY's 30-day returns, pre-shipment cancellations, refund processing and return shipping terms. Operated by NAFI LLC.",
  ready: true,
  updated: "2026-10-20",
  updatedLabel: "October 20, 2026",
  sections: [
    {
      id: "eligibility",
      title: "1. 30-day returns",
      paragraphs: [
        `You may request a return within ${siteConfig.returnWindowDays} calendar days after your order is delivered. For a change-of-mind return, items must be unused, unwashed and undamaged, with their original tags and packaging where reasonably possible.`,
        "The condition requirements for change-of-mind returns do not limit your rights if an item arrives damaged, is defective or is incorrect. Your statutory consumer rights remain unaffected by this policy.",
      ],
    },
    {
      id: "cancellations",
      title: "2. Order cancellations",
      paragraphs: [
        "You may request cancellation before your order is shipped. Contact customer support as soon as possible with your order number and a clear request to cancel. We will confirm whether cancellation has been approved. A request alone does not confirm cancellation; if the order has already shipped, the normal return process applies.",
        "Approved cancellations are refunded to the original payment method. No returned parcel or inspection is required for an order cancelled before shipment. Applicable statutory refund deadlines apply, and additional payment-provider or bank processing time may be needed for the credit to appear.",
      ],
    },
    {
      id: "faulty-items",
      title: "3. Damaged, defective or incorrect products",
      paragraphs: [
        "If your item arrives damaged, is defective or is not what you ordered, contact customer support with your order number, a description of the issue and relevant photographs where available. We will review the issue and provide an appropriate replacement, return or refund, subject to applicable consumer law.",
        "When the damage, defect or error is attributable to HORIZONY, we cover reasonable return-shipping costs. Please contact us for the return arrangements so that you are not required to bear additional return-shipping costs for an error that is our responsibility. The 30-day change-of-mind window does not shorten any longer period or remedy provided by applicable law.",
      ],
    },
    {
      id: "requesting-return",
      title: "4. How to request a return",
      paragraphs: [
        "Contact customer support on WhatsApp using the link below. Include your order number, the item or items you wish to return and your reason for returning them. For damaged, defective or incorrect items, include a description and relevant photographs where available. Do not send payment card numbers or card security codes.",
        "Support will provide instructions individually, including the authorized return destination and the arrangements applicable to your return. Contact support before sending a parcel and follow the instructions provided. The company's registered business address and virtual mailbox are not designated return destinations; do not send merchandise there unless support specifically confirms that the location can accept your return.",
      ],
    },
    {
      id: "refunds",
      title: "5. Refund decisions and processing",
      paragraphs: [
        "After we receive and inspect your return, we will notify you whether it has been approved and explain the reason if it is declined. For an eligible return, approved refunds will be initiated to the original payment method within 5–10 business days after receipt and inspection. If applicable law requires an earlier refund, that deadline applies.",
        "Refund initiation is the point at which we submit the refund through the payment provider. Your provider or bank may need additional time to post the credit to your account. If you have received refund confirmation but cannot see the credit, check with your payment provider or bank and contact us with your order number for assistance.",
        "The treatment of original delivery charges follows applicable law. Nothing in this policy excludes a refund of delivery charges where the law requires one.",
      ],
    },
    {
      id: "return-shipping",
      title: "6. Who pays return shipping",
      paragraphs: [
        "For ordinary change-of-mind returns, you pay the return-shipping cost unless applicable law requires otherwise. Support will provide the authorized destination and return instructions.",
        "For confirmed damaged, defective or incorrect items attributable to HORIZONY, HORIZONY covers reasonable return-shipping costs. Contact support before arranging return shipment so we can provide the appropriate instructions and cost arrangements.",
      ],
    },
    {
      id: "exchanges",
      title: "7. Exchanges and exclusions",
      paragraphs: [
        "Exchanges are handled through a return and a new order. Request a return for the original item under this policy, then place a separate order for the desired item or size. The new order is subject to availability and the price and delivery terms shown at the time of purchase. Each transaction is handled separately; approval of a return does not reserve a replacement item.",
        "Any product-specific exclusion from change-of-mind returns, such as for a personalized product or a hygiene-sensitive item, must be clearly disclosed before purchase and permitted by applicable consumer law. This policy does not automatically exclude those categories. No exclusion limits rights relating to damaged, defective or incorrect goods, or other statutory rights that cannot be excluded.",
      ],
    },
    {
      id: "contact",
      title: "8. Contact HORIZONY",
      paragraphs: [
        "HORIZONY — operated by NAFI LLC, a company registered in New Mexico, USA.",
        "Website: https://horizony.store. WhatsApp is our sole customer support channel for cancellations, returns, refunds and exchanges. Use the number and link below. Return destinations are supplied individually by support.",
      ],
      links: [{ href: "https://horizony.store", label: "horizony.store" }, { href: "/shipping", label: "Shipping Policy" }],
    },
  ],
};
