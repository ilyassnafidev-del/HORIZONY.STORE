# HORIZONY policy and support implementation

Updated October 20, 2026.

## Confirmed support channel

The owner confirmed WhatsApp as the sole customer support and privacy contact:

- Display: +1 (406) 608-6028
- Link: https://wa.me/14066086028
- Configuration: `siteConfig.supportWhatsappNumber` / `siteConfig.supportWhatsappUrl`.

Contact, Refund & Cancellation, Privacy, Terms and the footer share `SupportContact`. No support email or mailto link is configured. Customer email inputs in the inactive checkout preview remain unchanged; those are customer details, not a support channel.

## Final Refund & Cancellation Policy

The owner confirmed 30 calendar days after delivery for return requests; unused, unwashed, undamaged change-of-mind items, with original tags and packaging where reasonably possible; cancellation requests before shipment; eligible return refunds initiated within 5–10 business days after receipt and inspection; customer-paid change-of-mind return shipping unless law requires otherwise; and HORIZONY-paid reasonable return shipping for confirmed faults or errors attributable to HORIZONY.

Exchanges use a return and new order. Support supplies return instructions and the authorized destination individually. The registered business address/virtual mailbox is not designated for returns. No product-category exclusions have been invented. Mandatory consumer rights and earlier statutory refund deadlines remain unaffected.

The final policy appears at `/refund-policy/` and the preserved `/returns/` URL. Canonical: `/refund-policy/`. It has no draft notice, is indexable and has a sitemap entry. Terms summarize the confirmed refund terms. Footer and checkout link to the policy.

## Other policy status

Privacy and Terms now use WhatsApp, including privacy request instructions and disclosure of the external support service. Their other unconfirmed operating terms retain the existing draft status and noindex. Updating the support channel does not imply that payment, retention, shipping-region or dispute arrangements have been confirmed. No Teleport approval or legal compliance guarantee is made.

## Website behavior

- Shipping: 3–7 business days from shipment, excluding processing time; processing timeframe remains unconfirmed. Shipping, Terms and checkout share the same wording.
- Business: HORIZONY, operated by NAFI LLC, registered in New Mexico, USA. Business address: 8206 Louisiana Blvd NE, Ste A #10916, Albuquerque, NM 87113, USA.
- Checkout stays disabled. Product images, catalog data, prices, cart calculations and payment behavior are preserved.

## Verification

Production build verification checks every generated storefront page for the configured WhatsApp footer link and absence of mailto contact links. Requested pages must also contain their own support link. Refund pages must contain the confirmed timings and no draft notice. Existing catalog and asset verification remains active.

References: [FTC merchandise order rule](https://www.ftc.gov/legal-library/browse/rules/mail-internet-or-telephone-order-merchandise-rule), [WhatsApp privacy policy](https://www.whatsapp.com/legal/privacy-policy).
