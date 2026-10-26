import { TLSSocket } from "node:tls";
import { database, query } from "../lib/commerce/db.ts";
import { priceAmounts, priceIds, origin, checkoutReady } from "../lib/commerce/settings.ts";
import { stripeClient } from "../lib/commerce/stripe.ts";

// Private CLI only. Never print connection strings, Stripe objects, or raw errors.
let failures=0;
function report(ok:boolean,label:string){console.log(`${ok?"PASS":"FAIL"}: ${label}`);if(!ok)failures++;return ok;}
function category(error:unknown){
 const code=(error as {code?:string})?.code;
 return ({"28P01":"database authentication rejected","3D000":"database does not exist","42P01":"missing table: run npm run db:migrate","42703":"missing column: run npm run db:migrate","42501":"database permissions rejected","ENOTFOUND":"database DNS lookup failed","ENETUNREACH":"database network unreachable; check Supabase session pooler for IPv4","ETIMEDOUT":"database connection timed out","ECONNREFUSED":"database connection refused","CERT_HAS_EXPIRED":"database TLS certificate expired","SELF_SIGNED_CERT_IN_CHAIN":"database TLS CA certificate required","DEPTH_ZERO_SELF_SIGNED_CERT":"database TLS CA certificate required","UNABLE_TO_VERIFY_LEAF_SIGNATURE":"database TLS certificate chain could not be verified","ERR_TLS_CERT_ALTNAME_INVALID":"database TLS hostname mismatch"} as Record<string,string>)[code||""]||"private service check failed; inspect provider settings without sharing raw errors";
}
try{
 try{report(origin()==="https://horizony.store","APP_URL is https://horizony.store");}catch{report(false,"APP_URL must be a valid HTTPS origin");}
 const required=["DATABASE_URL","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET",...priceAmounts.map(amount=>`STRIPE_PRICE_${amount}`)];
 for(const name of required)report(Boolean(process.env[name]?.trim()),`${name} is configured`);
 report(/^whsec_/.test(process.env.STRIPE_WEBHOOK_SECRET||""),"Webhook signing secret has the expected format; delivery must still be verified");
 report(process.env.CHECKOUT_ENABLED==="true","CHECKOUT_ENABLED=true (keep false until verification is complete)");
 const live=/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY||"");
 report(live,"Stripe key uses live mode");
 report(process.env.STRIPE_LIVE_PAYMENTS_ENABLED==="true","STRIPE_LIVE_PAYMENTS_ENABLED=true (activate only after verification)");
 if(process.env.DATABASE_URL){
  let connected=false;
  try{
   const url=new URL(process.env.DATABASE_URL);
   if(!["postgres:","postgresql:"].includes(url.protocol))throw Error("Invalid database URL");
   await query("SELECT 1");connected=report(true,"PostgreSQL connection and certificate verification");
   const local=["localhost","127.0.0.1","::1"].includes(url.hostname);
   const client=await database().connect();
   try{const stream=(client as unknown as {connection:{stream:unknown}}).connection.stream;report(local||(stream instanceof TLSSocket&&stream.encrypted&&stream.authorized),"Client-to-database/pooler transport uses verified TLS");}finally{client.release();}
  }catch(error){report(false,category(error));}
  if(connected){
   try{const admins=await query("SELECT count(*)::int AS count FROM store_admins WHERE must_change_password=false");report(admins.rows[0]?.count>0,"Admin setup and mandatory password change completed");}catch(error){report(false,category(error));}
   for(const table of ["store_orders","store_checkout_attempts","store_payment_events","store_sessions","store_rate_limits","store_shipping_rates","store_admins","store_order_notes"]){
    try{await query(`SELECT * FROM ${table} LIMIT 0`);report(true,`${table} exists and is readable`);}catch(error){report(false,`${table}: ${category(error)}`);}
   }
   try{
    const result=await query("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='store_orders'::regclass AND conname='store_orders_payment_status_check'");
    report(Boolean(result.rows[0]?.definition.includes("FAILED")),"Payment status migration includes FAILED");
   }catch(error){report(false,category(error));}
  }
 }
 if(process.env.STRIPE_SECRET_KEY){
  const stripe=stripeClient();
  try{const account=await stripe.accounts.retrieve(null);report(account.charges_enabled===true,"Stripe account can accept charges");}catch{report(false,"Stripe account lookup: verify key and API permissions");}
  for(const amount of priceAmounts){
   const id=priceIds()[amount];if(!/^price_/.test(id)){report(false,`STRIPE_PRICE_${amount} must be a Price ID`);continue;}
   try{const price=await stripe.prices.retrieve(id);report(price.livemode===live&&price.active&&price.currency==="usd"&&price.unit_amount===amount&&price.type==="one_time",`Stripe price for ${amount} cents is active, USD, one-time, and matches key mode`);}catch{report(false,`Stripe price for ${amount} cents: verify ID, mode and API permissions`);}
  }
  try{
   const events=["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","checkout.session.expired","charge.refunded"];
   let matched=false;
   for await(const endpoint of stripe.webhookEndpoints.list({limit:100})){
    if(endpoint.url.replace(/\/$/,"")===`${origin()}/api/stripe/webhook`&&endpoint.status==="enabled"&&endpoint.livemode===live&&events.every(event=>endpoint.enabled_events.includes("*")||endpoint.enabled_events.includes(event as never))){matched=true;break;}
   }
   report(matched,"Matching enabled Stripe webhook has all required events");
  }catch{report(false,"Webhook endpoint lookup: verify Stripe API permissions and dashboard settings");}
 }
 report(checkoutReady(),"Checkout activation gate");
 console.log("NOT VERIFIED: database writes, webhook delivery/signing-secret match, real payment and end-to-end order updates. This command is read-only and does not enable checkout.");
}catch{report(false,"Diagnostic could not finish; no secrets or raw errors were printed");}
finally{process.exitCode=failures?1:0;if(process.env.DATABASE_URL){try{await database().end();}catch{/* Never print private driver errors. */}}}
