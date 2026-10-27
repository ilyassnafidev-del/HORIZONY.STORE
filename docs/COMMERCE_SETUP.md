# HORIZONY — Hostinger, PostgreSQL, Stripe and administrator setup

The code is deployed with payment activation **off**. Do not set live-payment flags until the test checklist below passes. Never put secret values in GitHub, a `NEXT_PUBLIC_` variable, browser code, screenshots, or chat.

## 1. Hostinger application

Use the existing repository `ilyassnafidev-del/HORIZONY.STORE`, branch `main`, Next.js Node.js Web App, Node.js 24.x, build `npm run build`, startup `npm start`, output `.next`. A static `out` deployment cannot run orders, authentication or webhooks; static export is intentionally rejected.

In the site's Hostinger **Website Dashboard → Environment variables**, use **Add more** for missing names, save with **Apply changes**, then restart/redeploy. Do not add surrounding quotes to values. These are runtime variables, not public build variables. Hostinger can also show this card under **Review build settings → Environment variables → Edit**.

Keep `CHECKOUT_ENABLED=false` and `STRIPE_LIVE_PAYMENTS_ENABLED=false` initially. No secret is needed to build the website; missing services fail closed at runtime.

## 2. Create a real PostgreSQL database

Hostinger's managed/shared plans provide MySQL, not PostgreSQL. This application needs an external PostgreSQL provider (for example Neon or Supabase), or a PostgreSQL server you operate. Do not enter a MySQL URL.

1. Create the PostgreSQL project/database and a database role. Select a region and retention/backups appropriate for your business and customers.
2. Copy its **PostgreSQL connection string** privately. Use a TLS connection; a managed provider's pooled URL is suitable for runtime. If your provider requires a custom root certificate, copy that public CA certificate into `DATABASE_CA_CERT` (PEM, or literal `\n` line separators).
3. Set `DATABASE_URL` in Hostinger and `DATABASE_SSL=true`. Certificate verification stays enabled. Do not disable verification for a remote database.
4. For initial schema setup, use this repository on your own trusted computer with Node.js 24. Copy `.env.example` to the Git-ignored `.env.local` and fill the private database values in that local file. Do not commit or share the file.
5. In the project directory, run:

   ```text
   npm ci
   npm run db:migrate
   ```

   The migration creates the order, checkout attempt, verified event, session, admin, internal note, rate-limit and shipping-rate tables. It is repeatable and does not erase orders.
6. Use a restricted application database role for production (SELECT/INSERT/UPDATE/DELETE on the store tables; no schema administration). Run schema migrations with a separately controlled migration role if your provider supports this. Keep provider backups/encryption and access controls enabled.

These commands can run on your computer against the external database. Do not rely on `npm` over SSH on Hostinger Business/Cloud: Hostinger documents that deployment commands run through its deployment system instead.

## 3. Set up administrator Ilyass

With the same private database configuration on your trusted computer:

```text
npm run admin:setup
```

The password prompt is hidden. No password is written to source code or printed. The database receives only a salted scrypt hash. Choose a unique setup password of at least 14 characters with uppercase, lowercase, a number and a symbol.

- Login: `https://horizony.store/admin/login/`
- Dashboard: `https://horizony.store/admin/`
- Username: `Ilyass`
- First sign-in requires another strong password before customer information is available.
- Weak temporary bootstrap passwords are usable only for local development. **Production sign-in rejects them.** If you initially used a weak value, run `npm run admin:setup -- --reset` in your trusted terminal and enter a strong setup password. This invalidates old admin sessions.
- The authenticated password-change page also allows later password rotation. Changing the password invalidates existing admin sessions and issues a fresh one.

There is no public registration or web-based bootstrap endpoint. Administrator pages and APIs enforce authorization. Merely knowing `/admin` grants no data access.

## 4. Stripe test credentials and five prices

1. Open your Stripe Dashboard and switch to **Test mode / Sandbox**. Obtain a test secret API key. Store it as `STRIPE_SECRET_KEY` in Hostinger and your private `.env.local`. Do not use a publishable key or place a secret in `NEXT_PUBLIC_`.
2. Create/retrieve five **one-time, USD** test Prices with these exact unit amounts. Copy their actual `price_…` IDs from Stripe into the corresponding variables:

   | Variable | Exact USD amount |
   |---|---:|
   | `STRIPE_PRICE_100` | $1.00 |
   | `STRIPE_PRICE_1495` | $14.95 |
   | `STRIPE_PRICE_2995` | $29.95 |
   | `STRIPE_PRICE_4495` | $44.95 |
   | `STRIPE_PRICE_5995` | $59.95 |

3. Test and live Price IDs are different. Never mix modes. The server retrieves each used Price and rejects an inactive, recurring, non-USD or wrong-amount Price before redirecting.
4. Configure Stripe's automatic calculation service and your business registrations/settings in Stripe. The app enables Stripe automatic calculation. The website shows the items and shipping amount; Stripe presents the final amount for customer review before payment. No extra application fee is added.
5. Enable the payment methods you want in Stripe. Hosted Checkout displays cards and eligible Apple Pay/Google Pay wallets when supported by the account, device, browser and customer location; the app never receives card numbers or CVVs.

The five supplied Payment Links are preserved exactly in `lib/commerce/settings.ts`, but are **not** used as a fallback for arbitrary carts. A fixed single-price link could charge the wrong amount for mixed products or quantities. This integration instead creates a server-side Checkout Session with the corresponding verified Price IDs and quantities, plus a unique order reference. Products that share a price are grouped by Price ID on Stripe; the store's immutable order snapshot retains the exact product names, sizes and quantities.

## 5. Stripe webhook endpoint

In Stripe's developer/workbench **Webhooks / Event destinations**:

1. Add the exact HTTPS endpoint (including its final slash):

   ```text
   https://horizony.store/api/stripe/webhook/
   ```

2. Subscribe to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `charge.refunded`
3. Reveal that endpoint's signing secret and set `STRIPE_WEBHOOK_SECRET` privately. Use the secret for the correct test/live destination. Restart the Hostinger app after changing it.
4. The route validates the signature against the unmodified body. It then retrieves the actual Stripe session/line items/payment intent and matches order ID, stored session, currency, amounts, Price IDs, quantities and mode. Repeated events are idempotent. A success URL or query parameter can never mark an order paid.

A locally forwarded Stripe CLI endpoint has its own signing secret. For local development, use the secret printed by `stripe listen --forward-to localhost:3000/api/stripe/webhook/`. A generic `stripe trigger` fixture is not proof that a real store order has been paid: it has no matching saved order/session and is ignored.

## 6. Enable TEST checkout and complete end-to-end verification

Use a separate test database or clearly retain test records for testing. Set `CHECKOUT_ENABLED=true` with the **test** key, test Price IDs and test endpoint signing secret. Keep `STRIPE_LIVE_PAYMENTS_ENABLED=false`.

The checkout and order pages explicitly label test mode. Test orders are stored separately by mode and excluded from live revenue reports. They are not real purchases or shipments.

1. Finish the admin password change, then run `npm run commerce:check` using the same private settings. This checks database tables, secure admin setup and all five Stripe prices. It does not claim webhook delivery has been tested.
2. Add the $1 wristband, complete a supported shipping address and proceed. Verify an unpaid order appears in the database/admin before Stripe opens.
3. Complete a Stripe test payment using the official test details (for example `4242 4242 4242 4242`, a future expiry and test CVC). Do not use real card details in test mode.
4. Check the endpoint delivery is successful in Stripe and the store displays **Test · Paid** only after verification. Check order items, amount, order number, paid timestamp and payment reference in admin.
5. Confirm only purchased quantities are removed from the bag; unrelated products and subsequently added quantities remain. Refreshing the status page must not deduct twice.
6. Repeat for all four clothing prices, multiple quantities, and a mixed cart. The server must refuse a deliberately wrong configured Price ID/amount.
7. Cancel or abandon checkout. The order must remain unpaid; the bag and saved shipping details must remain, and Retry Payment must return to the existing correct hosted flow.
8. Test a declined payment and expiry. Test a refund in Stripe test mode and confirm the verified refund status/amount appears in admin.
9. Test a fresh/incognito browser cannot read another customer's order. Customers do not have passwords/accounts here: history is limited to their secure browser session (up to 30 days). Keep the same browser after Stripe returns.
10. Test admin sign-out, incorrect passwords, rate limiting, password-change enforcement, filters, search, CSV, notes and fulfillment. Fulfillment must not change payment status; unpaid orders cannot be marked shipped/delivered.
11. Check desktop/mobile checkout and the wristband's normal quantity + Add to Bag row. There is no special Buy Now button.

Automated tests use isolated embedded PostgreSQL and Stripe's local signature helpers; they never claim to replace these real Stripe account/network tests.

## 7. Shipping controls

All initially enabled destinations start with **$0.00 / Free Shipping**, including the wristband. The default list is European destinations plus US, CA, AU and GB; see `SHIPPING_COUNTRIES` in `.env.example` for the exact ISO codes. Review that list against your actual fulfillment coverage and Stripe account eligibility before activation.

In the dashboard, **Shipping by destination** lets you select a country, enable/disable delivery and enter a USD amount. Values are stored in PostgreSQL. Changes affect new orders; an existing order's quoted shipping amount is immutable. Do not enable a destination you cannot fulfill. The checkout lists only currently enabled destinations and adapts address fields from Google's libaddressinput metadata and ISO country data.

The confirmed transit window remains **3–7 business days from shipment**, excluding processing. A processing-time promise has not been invented.

## 8. Activate live payments only after the above succeeds

1. Make sure real merchandise, fulfillment coverage, processing information, privacy retention/transfer arrangements and business sale terms are ready. Review the existing Terms draft before commercial launch.
2. Switch to the correct **live** secret key and the five matching live Price IDs. Create a **live** webhook destination with the same event list and install its separate signing secret.
3. Set `APP_URL=https://horizony.store`, `CHECKOUT_ENABLED=true`, and only now set `STRIPE_LIVE_PAYMENTS_ENABLED=true`. Restart/redeploy.
4. Run the configuration check again with private live settings. Confirm all prices are correct and webhook delivery works before inviting customers. Do not perform an unapproved live purchase just to test a deployment.
5. If any check fails, immediately set `CHECKOUT_ENABLED=false`; saved orders and history remain available. Live charge/refund events can still be verified for existing orders.

## Environment reference

| Variable | Purpose |
|---|---|
| `APP_URL` | Canonical HTTPS origin, normally `https://horizony.store` |
| `DATABASE_URL` | Private PostgreSQL connection URL |
| `DATABASE_SSL` | `true` for hosted DB; `false` allowed only for loopback development |
| `DATABASE_CA_CERT` | Optional provider CA certificate; never disable verification |
| `STRIPE_SECRET_KEY` | Private test or live secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the matching endpoint/mode |
| `STRIPE_PRICE_100`, `_1495`, `_2995`, `_4495`, `_5995` | Exact Stripe one-time USD Price IDs |
| `CHECKOUT_ENABLED` | Default `false`; enable first only for configured tests |
| `STRIPE_LIVE_PAYMENTS_ENABLED` | Default `false`; separate explicit live-payment gate |
| `SHIPPING_COUNTRIES` | Optional ISO country-code override; DB shipping controls can enable/disable destinations |

No admin plaintext password or general-purpose session secret is committed. Session tokens are random, stored only as hashes on the server, HttpOnly, and Secure on HTTPS. Admin sessions last up to eight hours; customer sessions up to 30 days. Expired cookies no longer authorize access.

## Sources

- Hostinger environment variables: https://www.hostinger.com/support/how-to-edit-or-add-environment-variables-after-deployment/
- Hostinger Node.js deployment: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- Hostinger database engine support: https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/
- PostgreSQL connection example: https://neon.com/docs/connect/connect-from-any-app
- Stripe webhook fulfillment: https://docs.stripe.com/checkout/fulfillment
- Stripe test guidance: https://docs.stripe.com/testing
- Address data: https://github.com/google/libaddressinput — Apache 2.0; license in `docs/ADDRESS_DATA_LICENSE.txt`.

Optional connection limit: DATABASE_POOL_MAX defaults to 8 (range 1–20). Set it to the limit appropriate for your database provider. Local socket-bridge QA uses 1; production PostgreSQL supports concurrent connections.

## Existing Supabase project

Reuse the existing Supabase database: set the private Hostinger DATABASE_URL to its PostgreSQL connection string (not the Supabase HTTPS project URL or anon key). For an IPv4 Hostinger runtime, use Supabase Connect → Session pooler; preserve TLS verification and provide DATABASE_CA_CERT if required. No Supabase browser SDK or new database is needed.

Run npm run db:migrate against this database after this update; it reuses store_orders and the existing related tables and extends the existing status constraint for FAILED. New checkout orders start PENDING. Verified failed asynchronous payments become FAILED; verified expired sessions become CANCELED. The cancel redirect alone never changes a payment status. Existing orders are preserved.

If the checkout button stays disabled, verify DATABASE_URL connectivity/TLS and that the store tables exist, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, all five STRIPE_PRICE_* variables, CHECKOUT_ENABLED=true, and (only after live verification) STRIPE_LIVE_PAYMENTS_ENABLED=true. Run npm run commerce:check privately; never send secret values in chat. Country options remain visible during a database outage, but payment stays blocked until saving orders is possible.

Supabase connection reference: https://supabase.com/docs/guides/database/connecting-to-postgres

## Diagnose a disabled production checkout safely

Run `npm run commerce:check` privately with the same environment values as Hostinger. It prints PASS/FAIL per variable name, activation flag, PostgreSQL/TLS check, existing store table, status migration, live Stripe account, five Price IDs and webhook registration. It never prints secret values, customer rows, provider objects or raw exceptions, never writes database records, and never enables checkout. Restricted Stripe keys need read permissions for the account, prices and webhook endpoint checks. Failure of a read permission check does not prove the service is unconfigured.

A public `POST /api/stripe/webhook/` without a signature returns **503 / Webhook is not configured** only when `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` is absent in the running Node application. When both exist it returns 400 for the missing signature. A 400 is only a presence check; it does not prove the key or signing secret is correct. Set the values privately in Hostinger, apply changes and restart/redeploy; a GitHub push alone cannot supply private credentials.

Keep both activation flags false while resolving failed checks. Complete the existing Stripe test checklist and confirm the live webhook signing secret and successful delivery before changing the flags to true. Preserve the existing Supabase project and use `npm run db:migrate` only against that project's verified PostgreSQL connection. A public configuration response cannot distinguish missing flags, missing credentials, bad TLS, missing tables, or disabled destinations; do not infer a database outage from `available:false` alone.

Store tables have RLS enabled with no browser policies, and PUBLIC/anon/authenticated table privileges revoked. Use the private table-owner PostgreSQL connection (the existing project's postgres connection) for this server. A separate restricted server role requires owner-approved RLS policies for that role; do not grant browser roles access to orders, sessions, or admin tables.

The deployed server now performs cached, read-only readiness checks using its own private environment: database order/payment tables, charge-enabled Stripe account, all five live/test-matched USD prices, active Stripe Tax settings, and an enabled matching webhook with all five events. `/api/checkout/config/` returns `configurationVerified: true` only when these pass, independently of the two activation flags. It does not expose credentials or provider responses. Failures log only the check category in private runtime logs. Order creation and Stripe retries also require readiness, so a stale frontend cannot bypass a failed check. Checks are cached for 30 seconds to limit provider requests.

This readiness result does not prove a real signed webhook was delivered. Verify an actual Stripe event delivery and its payment-state behavior before activating live checkout. Do not treat an unsigned-request rejection or a success redirect as proof of payment.
