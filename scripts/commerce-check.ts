import { database, query } from "../lib/commerce/db.ts";
import { priceAmounts, priceIds, origin } from "../lib/commerce/settings.ts";
import { stripeClient } from "../lib/commerce/stripe.ts";
try{
  origin();if(!process.env.DATABASE_URL||!process.env.STRIPE_SECRET_KEY||!process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_"))throw Error("Missing private configuration.");
  await query("SELECT id FROM store_orders LIMIT 1");await query("SELECT country FROM store_shipping_rates LIMIT 1");
  const admins=await query("SELECT id FROM store_admins WHERE must_change_password=false");if(!admins.rows.length)throw Error("Finish admin setup and password change first.");
  const stripe=stripeClient();for(const amount of priceAmounts){const id=priceIds()[amount];if(!id)throw Error("A Price ID is missing.");const price=await stripe.prices.retrieve(id);if(!price.active||price.currency!=="usd"||price.unit_amount!==amount||price.type!=="one_time")throw Error(`Price configuration mismatch for ${amount} cents.`);}
  console.log(`Database and all five USD Stripe prices verified in ${process.env.STRIPE_SECRET_KEY.includes("_live_")?"LIVE":"TEST"} mode.`);
  console.log("This does not verify webhook delivery or a real test payment. Complete the documented end-to-end tests before enabling live payments.");
}catch(error){const message=(error as Error).message;console.error(/^(Missing|Finish|A Price|Price configuration)/.test(message)?message:"Configuration check failed. Review the private database/Stripe settings; secrets are not printed.");process.exitCode=1;}finally{if(process.env.DATABASE_URL)await database().end();}
