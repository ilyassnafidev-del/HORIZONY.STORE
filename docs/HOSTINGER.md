# Hostinger deployment

This is a Next.js **Node.js Web App**, not a static export. Use the existing GitHub repository/`main`, Node.js 24.x, `npm ci` (include dev dependencies during build), build `npm run build`, startup `npm start`, and `.next` output.

The source now includes private order APIs, Stripe webhooks, customer/admin sessions and the owner dashboard. These require PostgreSQL and private runtime environment variables. Checkout defaults to disabled; no credentials are included in GitHub. Public catalog pages build without a database connection.

Follow [COMMERCE_SETUP.md](COMMERCE_SETUP.md) for the complete step-by-step PostgreSQL, Stripe, five Price IDs, signing secret, admin password and activation instructions. Set variables in Hostinger's Website Dashboard → Environment variables and restart after runtime changes. Do not commit `.env.local`.

Normal production build verification checks the .next server output and every required storefront/API/admin entrypoint. `out` is not required. `build:static` is intentionally unsupported because static hosting cannot run payment verification or access controls.

The existing `horizony.store` domain and GitHub integration are preserved. A successful GitHub push triggers the Hostinger build; check its deployment log and public site before claiming hosting success. Live payment activation is a separate operator step after real Stripe tests pass.
