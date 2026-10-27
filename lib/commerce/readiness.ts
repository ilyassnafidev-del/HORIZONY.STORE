import Stripe from "stripe";
import { createHash } from "node:crypto";
import { query } from "./db.ts";

export const requiredPaymentEvents=["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","checkout.session.expired","charge.refunded"];
export function validConfiguredPrice(price:Pick<Stripe.Price,"active"|"currency"|"unit_amount"|"type"|"livemode">,amount:number,live:boolean){return price.active&&price.currency==="usd"&&price.unit_amount===amount&&price.type==="one_time"&&price.livemode===live;}
export function validConfiguredWebhook(endpoint:Pick<Stripe.WebhookEndpoint,"url"|"status"|"livemode"|"enabled_events">,origin:string,live:boolean){return endpoint.url.replace(/\/$/,"")===`${origin}/api/stripe/webhook`&&endpoint.status==="enabled"&&endpoint.livemode===live&&requiredPaymentEvents.every(event=>endpoint.enabled_events.includes("*")||endpoint.enabled_events.includes(event as never));}

let cached:{key:string;expires:number;result:Promise<boolean>}|undefined;
// Read-only, server-side checks. Cache concurrent requests; never expose provider errors or credentials.
export async function paymentServicesReady(origin:string,ids:Record<number,string>):Promise<boolean>{
 const secret=process.env.STRIPE_SECRET_KEY||"";
 if(!process.env.DATABASE_URL||!/^whsec_/.test(process.env.STRIPE_WEBHOOK_SECRET||"")||!/^(sk|rk)_(test|live)_/.test(secret)||Object.values(ids).some(id=>!/^price_/.test(id)))return false;
 const key=createHash("sha256").update(JSON.stringify([secret,process.env.DATABASE_URL,process.env.DATABASE_CA_CERT,process.env.STRIPE_WEBHOOK_SECRET,origin,ids])).digest("hex");
 if(cached?.key===key&&cached.expires>Date.now())return cached.result;
 const result=(async()=>{
  const stripe=new Stripe(secret,{maxNetworkRetries:0,timeout:8000});const live=secret.includes("_live_");
  const check=async(label:string,fn:()=>Promise<boolean>)=>{try{if(await fn())return true;}catch{/* Private provider errors must not be logged. */}console.warn(`Checkout readiness check failed: ${label}`);return false;};
  const checks=await Promise.all([
   check("database schema",async()=>{await query("SELECT id,payment_status,stripe_payment_intent,paid_at,shipping,total FROM store_orders LIMIT 0");await query("SELECT session_id,status FROM store_checkout_attempts LIMIT 0");await query("SELECT id,event_type,order_id FROM store_payment_events LIMIT 0");return true;}),
   check("Stripe account",async()=>(await stripe.accounts.retrieve(null)).charges_enabled===true),
   check("Stripe prices",async()=>(await Promise.all(Object.entries(ids).map(async([amount,id])=>validConfiguredPrice(await stripe.prices.retrieve(id),Number(amount),live)))).every(Boolean)),
   check("Stripe Tax",async()=>(await stripe.tax.settings.retrieve()).status==="active"),
   check("Stripe webhook registration",async()=>{for await(const endpoint of stripe.webhookEndpoints.list({limit:100})){if(validConfiguredWebhook(endpoint,origin,live))return true;}return false;}),
  ]);
  return checks.every(Boolean);
 })().catch(()=>false);
 cached={key,expires:Date.now()+30000,result};return result;
}
