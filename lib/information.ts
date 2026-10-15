import { siteConfig } from "./config";
export const information: Record<
  string,
  {
    title: string;
    kicker: string;
    intro: string;
    sections: { title: string; text: string }[];
  }
> = {
  contact: {
    title: "Let’s begin a conversation.",
    kicker: "THE STUDIO / CONTACT",
    intro: "The contact channel is being configured before the store opens.",
    sections: [
      {
        title: "Customer support",
        text: siteConfig.supportEmail
          ? `Our configured support address is ${siteConfig.supportEmail}.`
          : "A verified customer support address has not been provided. Contact functionality will be enabled once the store owner configures it.",
      },
      {
        title: "Business information",
        text:
          siteConfig.businessName && siteConfig.businessAddress
            ? `${siteConfig.businessName} — ${siteConfig.businessAddress}`
            : "Legal business name, registered address and operating details are awaiting confirmation. This storefront does not accept orders yet.",
      },
    ],
  },
  shipping: {
    title: "The journey to your everyday.",
    kicker: "INFORMATION / SHIPPING",
    intro:
      "Delivery services are being prepared. Checkout is currently a preview.",
    sections: [
      {
        title: "Destinations & rates",
        text: "Shipping destinations, carriers, delivery estimates and charges have not been configured. No delivery promises or costs apply to the example catalog.",
      },
      {
        title: "Before the store opens",
        text: "Confirmed delivery regions, estimated timelines, tracking information and any applicable customs terms will be published here before orders can be placed.",
      },
      {
        title: "Shipping at checkout",
        text: "A final order total will be available only after destination-based delivery and tax rates are configured. Your current bag shows a merchandise subtotal only.",
      },
    ],
  },
  returns: {
    title: "A considered fit.",
    kicker: "INFORMATION / RETURNS",
    intro:
      "Return terms will be published before the store begins accepting orders.",
    sections: [
      {
        title: "Return window & eligibility",
        text: siteConfig.returnWindowDays
          ? `Configured return window: ${siteConfig.returnWindowDays} days. Full eligibility terms await verification.`
          : "The return window, item condition requirements, exclusions and return shipping responsibility have not been confirmed.",
      },
      {
        title: "How returns will work",
        text: "A verified support channel, return instructions and refund handling procedure will be configured before launch. There is no active returns portal during this storefront preview.",
      },
      {
        title: "Your statutory rights",
        text: "Final terms must reflect applicable consumer rights for the business and delivery destinations. This preview does not establish a final commercial returns policy.",
      },
    ],
  },
  privacy: {
    title: "Your information, considered.",
    kicker: "INFORMATION / PRIVACY",
    intro:
      "Preview privacy information. A complete policy requires confirmed business and processing details before commercial launch.",
    sections: [
      {
        title: "What this preview stores",
        text: "Your shopping bag is stored in your browser’s local storage using product identifiers, sizes and quantities. It contains no customer address or payment information. Remove bag items to clear the selection.",
      },
      {
        title: "Checkout details",
        text: "The checkout form keeps entered details only in page memory for validation. It does not send them to a server or persist them. Leaving or refreshing the page clears them. No payment card fields are provided.",
      },
      {
        title: "Analytics & marketing",
        text: "This storefront includes no analytics, advertising trackers or newsletter collection. The hosting service may process operational request information under its own privacy terms.",
      },
      {
        title: "Before launch",
        text: "The verified data controller, contact address, processing purposes, retention periods, customer rights and any future providers must be configured and reviewed before accepting orders.",
      },
    ],
  },
  terms: {
    title: "A clear beginning.",
    kicker: "INFORMATION / TERMS",
    intro:
      "This is a storefront foundation with an example catalog. Payments and order processing are not active.",
    sections: [
      {
        title: "Catalog status",
        text: "Images show original HORISONY garment concepts. Materials, care instructions, sizes, measurements, prices and inventory are editable example information, awaiting verification against actual merchandise.",
      },
      {
        title: "Purchasing status",
        text: "Adding items to a bag does not place an order, reserve stock or create a purchase agreement. Checkout is a preview. There is no payment submission or successful-order state.",
      },
      {
        title: "Commercial terms",
        text: "Legal business identity, tax treatment, shipping conditions, return rights, dispute handling and governing jurisdiction must be confirmed before a commercial launch. These placeholders are not final sale terms.",
      },
    ],
  },
};
