# Deploy HORISONY to Hostinger

This repository exports a static website. No Node server, database, payment credentials or application secrets are required to serve the current storefront. Cart and checkout preview behavior stays in the browser; payments and order creation remain disabled.

## Build settings

| Setting | Value |
| --- | --- |
| Existing repository | `ilyassnafidev-del/HORIZONY.STORE` |
| Production branch | `main` |
| Project root | repository root (`.`) |
| Node | Node 24.x |
| Install | `npm ci` |
| Build | `npm run build` |
| Static output | `out` |
| Server entry/start command | none; static export |
| Canonical domain | `https://horizony.store` |

`npm run build` runs catalog/image checks, compiles with `next build --webpack`, then checks local references in the export. Webpack is selected explicitly to avoid the Turbopack PostCSS asset-processing failure reported on Hostinger. Keep Hostinger's build command set to `npm run build`; a bare `next build` uses Turbopack by default and also skips the npm lifecycle checks. It must succeed before publishing. `out/` is generated and deliberately excluded from the source branch. Do not serve the source directory or `.next/` as a static website.

## Hostinger with GitHub builds

1. In hPanel, use the Web App / Import Git Repository flow for a plan that supports builds. Connect your existing GitHub account and select this existing repository and `main`. Choose the import option that keeps this repository; do not choose a template or create a new app repository.
2. Configure the settings above. This is a static frontend export even though the source uses Next.js. If automatic framework detection selects a persistent Next.js server, use the frontend/static option or `Other` with output directory `out` and no entry file. Keep the static export configuration in `next.config.ts`.
3. Deploy and check the Hostinger preview. In the app's domain settings, connect `horizony.store` to this deployment. Use the DNS records supplied by your own Hostinger panel, then enable SSL/HTTPS. Do not copy an IP address from an example.
4. Verify `/shop/`, both collections, a direct product URL, cart and checkout, and image back/detail views. Confirm the hostname and valid HTTPS certificate. The checkout must continue to show that payment is unavailable.
5. Keep automatic deployment from `main` enabled for future source updates. Check GitHub Actions and Hostinger deployment logs after each update. Wait for a successful build before calling a release live.

An existing Hostinger website may already occupy the domain. Keep it backed up and use the panel's supported domain connection or migration flow; this repository upload does not remove any existing Hostinger website or change DNS.

Official guides: [GitHub builds](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) and [connect a custom domain](https://www.hostinger.com/support/how-to-connect-a-custom-domain-to-a-node-js-application/).

## Static hosting without a build service

1. On a trusted computer or GitHub Actions, run `npm ci`, `npm run build` and `npm run typecheck`.
2. Upload the **contents of `out/`** to the document root for `horizony.store` (normally its `public_html` directory). Include `_next/`, `images/`, `fonts/`, all route directories, `404.html`, sitemap, robots and `.htaccess`. If extracting an archive, `index.html` must end up directly inside the document root, not inside an extra `out/` folder.
3. Preserve unrelated server files. Use a backup and a deliberate release procedure; do not run a blanket delete or mirror command against a shared document root. Prefer GitHub-linked builds for regular updates.

The GitHub Actions artifact `horisony-hostinger-static` contains the generated website, including `.htaccess`. A plain Git checkout into `public_html` does **not** compile the Next.js source; deploy the build output.

## Future changes

- Edit products, inventory, galleries and integer-cent tier prices in `lib/catalog.ts`.
- Keep currency `USD`; the four current prices are $14.95, $29.95, $44.95 and $59.95. Tier labels remain internal.
- Keep canonical origin in `lib/config.ts` aligned with the actual domain. Metadata, sitemap, robots and structured breadcrumb links use that origin.
- Keep every product's front/back/detail WebP and its `-400` / `-800` variants together. `npm test` rejects missing files and duplicate original photos.
- Run `npm run build` and `npm run typecheck`, then commit and push to `main`. Use ordinary fast-forward pushes; never force-push over unrelated history.
- Store any future server-only secrets in Hostinger's environment settings or GitHub encrypted secrets. Never put payment secrets in public code or variables prefixed `NEXT_PUBLIC_`.
- Before enabling orders, implement a real server payment integration, price/stock validation, shipping, taxes, persistent orders and verified payment webhooks. The existing provider stub intentionally rejects checkout sessions.

## What this upload does not configure

The GitHub source and build configuration do not grant access to a Hostinger account. The owner must connect the repository in hPanel, select the actual hosting plan/site, connect the domain and confirm DNS/SSL. No Hostinger credentials are included in this repository.
