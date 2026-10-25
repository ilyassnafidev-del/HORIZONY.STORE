# HORIZONY Essential Wristband

Added October 25, 2026 using the existing product card, gallery, Quick Add, bag and checkout components. The original 20 garments, their four pricing tiers, original images, policies and payment behavior are retained.

- Product: `/products/horizony-essential-wristband/`
- Category: `/collections/accessories/`, also available in the main catalog and navigation.
- Price: `100` integer USD cents in `lib/catalog.ts`; every price display and total uses the existing `money` / `cartSubtotal` functions.
- Single selection option: `One size`. No circumference, garment measurements, physical stock count, reviews or sales figures are fabricated. `inventory: null` means no confirmed stock count; the quantity limit of 99 is a cart guard, not inventory.
- Buy Now adds the selected quantity to the existing bag and opens the existing checkout. Payments remain disabled; no payment provider or ordering behavior is changed.
- Three original built-in image_gen product images, with responsive WebP variants. Full prompts and provenance: `docs/wristband-images.json`. Asset paths: `public/images/horizony-essential-wristband-{front,back,detail}.webp` plus `-400` / `-800` variants.

## Build compatibility

The first build compiled and generated all pages, then Next.js stopped with a security notice for version 16.4.0. Official advisory confirms the affected versions and patched releases:
https://nextjs.org/blog/nextjs-security-update-october-14-2026

The compatible Next.js 16.4.3 patch and matching ESLint configuration are used. No security check is disabled and no forced dependency update is used.

## Verification

The catalog tests cover 21 unique products, the original clothing prices, all 63 distinct images and responsive variants, persisted cart price normalization, the wristband's $1.00 unit price, $3.00 for quantity three and $15.95 combined with the original $14.95 tee. Production build and browser checks must pass before pushing.

Final local verification: Node.js 24.21.0 production build and postbuild passed with Next.js 16.4.3, all nine tests passed, and npm reported zero vulnerabilities. Verified 37 storefront routes and 3,107 asset/link references. Browser checks passed for all three gallery views, selection validation, Add to Bag, quantity changes, persistence, Quick Add, Buy Now and the checkout price. Mobile width 390px showed no horizontal overflow. Payments remain disabled.
