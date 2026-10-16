# Hostinger image assertion fix

The failing production command was `npm run build`. Its `prebuild` lifecycle invokes `npm run verify:catalog`; `tests/assets.test.ts:8` then compared 132 WebP files with the required 180. This happened before `next build` or the postbuild export verifier ran.

The required count is 20 products × 3 product views × 3 delivery sizes = 180 files. The repository contained 44 views with their variants (132 files); eight T-shirts lacked back/detail views and their variants (48 files).

The fix adds those 48 missing files at their existing catalog paths. All sixteen views were recovered from previously generated, reference-matched outputs; no additional images were generated for this fix. Exact prompts and provenance are in `images-tees.json`. Previously committed images, product data, UI, styles, animation code, cart, checkout, sizes and prices were not modified. All catalog and export validation remains enabled and unchanged.

## Verification

- Reproduced the original `ERR_ASSERTION`, actual 132 / expected 180, locally.
- `npm run build` passes its prebuild, compilation, TypeScript and postbuild stages.
- All eight catalog, currency, pricing, cart and image tests pass.
- The export verifier passes 2,849 local references across 35 HTML pages and stylesheets.
- All 180 catalog WebPs decode; the 60 original views have distinct decoded image content.
- Git reports no changes to previously tracked source or assets; only the missing images and documentation were added.

## npm security review

`npm audit --omit=dev` reports zero production vulnerabilities. The full audit reports five high findings in one development-only dependency chain:

`eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3`

The underlying advisory is [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). At review, the advisory lists no patched version and npm's latest published `braces` is 3.0.3. The compatible Next.js lint patch 16.4.2 also still depends on the affected fast-glob chain. No compatible published update fixes this finding. npm proposes downgrading `eslint-config-next` to 14.2.35, a major tooling change that is unsuitable for the current Next.js 16 / ESLint 9 configuration.

No forced audit fix, incompatible downgrade, validation removal, package removal or unverified dependency override was applied. The development-only finding remains unresolved pending a suitable upstream release; the production audit is clean. Recheck the advisory and npm audit before future dependency maintenance.

## Hostinger

For a Hostinger Next.js Web App, use Node 24.x, `npm run build`, output `.next`, and `npm start`. Static-only hosting instead uses `npm run build:static` and output `out`. The postbuild verifier selects the relevant checks for each explicit build mode. Source checks do not themselves confirm a completed Hostinger deployment. See `HOSTINGER.md` for the current deployment settings and domain steps. Payment processing remains disabled.
