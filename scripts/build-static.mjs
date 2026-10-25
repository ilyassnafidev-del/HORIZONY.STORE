console.error('Static export is not available for this store: checkout, Stripe webhooks, private sessions and admin require the Next.js Node.js server. Use npm run build and npm start with .next output.');
process.exitCode = 1;
