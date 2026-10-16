# HORISONY

An original contemporary fashion storefront built with Next.js App Router, React, TypeScript, Tailwind CSS and Lucide. Public pages are prerendered at build time. The default build runs as a Next.js Node.js web application; a separate static-export build is also available. The shopping bag and checkout validation run in the browser.

## Run

Requires Node.js 24.x and npm; clean-build validation uses Node.js 24.21.0. Run `npm ci`, `npm run dev`, and open the printed localhost URL. `npm run build` validates all catalog images, creates the production `.next/` build with Webpack, then verifies its server files, prerendered routes, public assets, compiled CSS/JS and internal links. Run `npm start` to serve it. Normal builds never require `out/`. Use `npm run typecheck` and `npm test` for checks. For static hosting only, `npm run build:static` exports to `out/` and runs the static export verifier; `npm run preview` serves that export locally.

Source repository: https://github.com/ilyassnafidev-del/HORIZONY.STORE (branch `main`). Production canonical origin: https://horizony.store. See [Hostinger deployment](docs/HOSTINGER.md) for build settings, domain setup, deployment and future updates. Build outputs and credentials are excluded from Git. GitHub Actions validates pushes and pull requests and provides a static build artifact; Hostinger deployment starts only after you connect this repository in hPanel.

## Edit the store

- `lib/catalog.ts`: exactly 20 products, prices in integer cents, specifications, SKU, inventory, sizes, galleries and example measurements.
- `lib/config.ts`: currency, locale, canonical origin, announcement, support and business information. Update currency and **all catalog prices** together when changing currency; this is not an exchange-rate conversion.
- `lib/information.ts`: contact, shipping, returns, privacy and terms placeholders. Confirm these before commercial launch.
- `app/globals.css`: responsive design system.
- `public/images/`: 60 distinct AI-generated concept photographs; front/back/detail for each garment, each with 400px and 800px responsive variants. The original 24 source photos are preserved byte for byte; four prior generated views were recovered and 32 missing views were recreated from the existing garment references. Exact replacement prompts and provenance are in `docs/images-tees.json`, `docs/images-jackets.json` and `docs/images-recovered.json`. Recreated unseen rear details are inferred from each front reference.
- `public/fonts/`: locally hosted Manrope variable font and its SIL Open Font License.

## Checkout and payment integration

Checkout is deliberately inactive. It validates customer fields in page memory only. It never sends or saves entered details, has no card fields, and cannot place an order. The bag uses browser localStorage with only product IDs, sizes and quantities. `lib/payment.ts` declares a hosted-checkout provider interface; its current implementation rejects session creation.

Before activating payment, add a real server runtime, re-read authoritative product prices and stock, validate customer input server-side, configure destination-based shipping and taxes, create a secure provider session, verify signed webhooks, and persist orders only after provider confirmation. Never trust browser totals or store raw card data. Inventory is currently editable example data and does not reserve stock.

Product offers/rating structured data are deliberately omitted because merchandise and sale conditions are not yet verified. Breadcrumb schema, per-route metadata, canonical links, Open Graph, robots and sitemap are present. Cart and checkout are excluded from indexing. A private Site remains protected by hosting access controls.

## Launch configuration

Supply verified legal business details and support destination; replace policy placeholders; verify every price, material, measurement, care instruction and stock count against merchandise; configure delivery, tax and payment processing. Generated images represent original garment concepts, not evidence of manufactured inventory.

Performance scores are targets. Production validation checks the actual exported routes, styles, image sources, responsive image variants and font references. Passing these checks does not activate payment processing or configure a Hostinger account.
