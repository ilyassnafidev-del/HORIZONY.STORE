import { countryOptions, defaultShippingCountries } from "./input.ts";
import { siteConfig } from "../config.ts";
import { query } from "./db.ts";
import { paymentServicesReady } from "./readiness.ts";

export const paymentLinks: Record<number,string>={100:"https://buy.stripe.com/cNi3cv2kd2db3lq25l4gg04",1495:"https://buy.stripe.com/eVq6oHaQJ3hf1di39p4gg00",2995:"https://buy.stripe.com/cNifZh5wp4lj9JO39p4gg01",4495:"https://buy.stripe.com/14AeVd3ohaJH9JOdO34gg02",5995:"https://buy.stripe.com/dRmbJ10c54lj09e7pF4gg03"};
export const priceAmounts=[100,1495,2995,4495,5995] as const;
export function origin() { const url=new URL(process.env.APP_URL||siteConfig.origin); if(url.protocol!=="https:"&&!["localhost","127.0.0.1"].includes(url.hostname))throw Error("APP_URL must use HTTPS."); return url.origin; }
export function shippingCountries() { const configured=(process.env.SHIPPING_COUNTRIES||defaultShippingCountries.join(",")).split(",").map(s=>s.trim().toUpperCase()); return countryOptions.filter(option=>defaultShippingCountries.includes(option.code)&&configured.includes(option.code)); }
export function priceIds() { return Object.fromEntries(priceAmounts.map(amount=>[amount,process.env[`STRIPE_PRICE_${amount}`]||""])) as Record<number,string>; }
export function checkoutReady() {
  const key=process.env.STRIPE_SECRET_KEY||"";
  return process.env.CHECKOUT_ENABLED==="true"&&Boolean(process.env.DATABASE_URL)&&Boolean(process.env.STRIPE_WEBHOOK_SECRET)&&/^(sk|rk)_(test|live)_/.test(key)
    &&(!key.includes("_live_")||process.env.STRIPE_LIVE_PAYMENTS_ENABLED==="true")&&Object.values(priceIds()).every(id=>/^price_/.test(id))&&shippingCountries().length>0;
}
export async function shippingOptions(){const base=new Set(shippingCountries().map(c=>c.code));const overrides=process.env.DATABASE_URL?(await query("SELECT country,cents,enabled FROM store_shipping_rates")).rows:[];return countryOptions.map(c=>{const saved=overrides.find(row=>row.country===c.code);return {...c,shippingCents:saved?.cents??0,enabled:defaultShippingCountries.includes(c.code)&&(saved?.enabled??base.has(c.code))};});}
export function checkoutServicesReady(){return paymentServicesReady(origin(),priceIds());}
export async function publicCheckoutConfig(){const countries=(await shippingOptions()).filter(c=>c.enabled);const configurationVerified=await checkoutServicesReady();return {available:checkoutReady()&&configurationVerified&&countries.length>0,configurationVerified,testMode:Boolean(process.env.STRIPE_SECRET_KEY?.includes("_test_")),countries};}
