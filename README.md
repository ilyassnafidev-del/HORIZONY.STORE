# HORIZONY / HORISONY

The existing premium apparel and accessories storefront, upgraded in place with server-side orders, Stripe hosted checkout and a private store dashboard. All 21 products, existing photographs, USD prices and normal product layouts are preserved. The wristband remains exactly $1.00 and uses the normal quantity + Add to Bag row.

## Development and build

Node.js 24.x: `npm ci`, `npm run dev`. Production: `npm run build` and `npm start`. The build runs catalog/image/price tests plus commerce/security/PostgreSQL tests, then verifies the Next.js `.next` output and all required endpoints. `npm test` and `npm run typecheck` are also available.

The storefront uses a Node.js server; static exports cannot provide private order storage, authentication or Stripe webhooks. Existing catalog pages remain prerendered where possible. Checkout configuration is read securely at runtime.

## Activation and private configuration

**Payments default to disabled.** No API key, database password, webhook signing secret or admin plaintext password is in source. Copy `.env.example` only to a private ignored `.env.local` or set the variables in Hostinger.

Read **[docs/COMMERCE_SETUP.md](docs/COMMERCE_SETUP.md)** for step-by-step database, Stripe test/live setup, all five Price IDs, webhook events, admin initialization and verification before activation. [docs/HOSTINGER.md](docs/HOSTINGER.md) covers deployment settings.

- `npm run db:migrate`: create/update PostgreSQL tables without deleting orders.
- `npm run admin:setup`: hidden password prompt for Ilyass; first login requires a strong password change. Production refuses weak bootstrap passwords.
- `npm run commerce:check`: private configuration/price checks; actual Stripe test payments and endpoint delivery still need to be tested in your account.
- Owner login: `/admin/login/`; dashboard: `/admin/`.
- Customer history: `/orders/`; protected order status: `/order-status/<order-id>/`.

## Payment and order architecture

All product amounts are server-derived in integer USD cents. Submitted shipping details and an immutable product/price/quantity snapshot are saved as unpaid before Stripe opens. Mixed carts use verified Stripe Price IDs, not a fixed single-price Payment Link. Signed webhooks and server-side Stripe retrieval match the stored order, session, mode, prices, quantities and amounts before marking payment verified. Replayed events are idempotent; test orders are labeled and excluded from live revenue.

Customers see only their own session's orders. The admin requires a hashed password, protected session and authorization on every private API, with persistent login rate limiting and same-origin mutation checks. Admins can change fulfillment, notes and destination shipping rates, but cannot manually mark a payment paid. CSV exports escape spreadsheet formulas.

Free Shipping is the initial rate for supported destinations and can be changed per country in admin. The approved shipping window is 3–7 business days from shipment, excluding processing. The searchable selector uses ISO country data and Google's licensed international address metadata. The Privacy Policy describes the implemented customer details, database, sessions, Stripe and WhatsApp flows.

## Catalog and assets

`lib/catalog.ts` holds the 20 original garments and HORIZONY Essential Wristband. Clothing prices remain $14.95/$29.95/$44.95/$59.95, with the wristband at $1.00. Public cards and pages do not display internal tiers. The cart recomputes prices from this configuration.

`public/images/` contains 63 distinct original concept photographs and their 400/800px WebP variants. Existing image provenance is in `docs/images-*.json` and `docs/wristband-images.json`. Generated concepts are not evidence of manufactured stock; no new reviews, sales figures or inventory counts have been fabricated.
