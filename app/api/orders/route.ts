import { randomUUID } from "node:crypto";
import { checkoutReady } from "@/lib/commerce/settings";
import { createOrder, publicOrder } from "@/lib/commerce/orders";
import { query } from "@/lib/commerce/db";
import { hostedCheckout } from "@/lib/commerce/stripe";
import { ApiError, failure, issueSession, json, rateLimit, readJson, sameOrigin, session, setSession } from "@/lib/commerce/security";
import type { Order } from "@/lib/commerce/order-model";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(){try{const current=await session("customer");if(!current)return json({orders:[]});const orders=(await query<Order>("SELECT * FROM store_orders WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 100",[current.subject_id])).rows;return json({orders:orders.map(publicOrder)});}catch(error){return failure(error);}}
export async function POST(request:Request){try{
  sameOrigin(request);if(!checkoutReady())throw new ApiError(503,"Online checkout is not yet available. Your shopping bag has been kept.");
  await rateLimit("checkout-global","store",120,60);
  const input=await readJson(request);const current=await session("customer");const customerId=current?.subject_id||randomUUID();await rateLimit("checkout-customer",customerId,10,600);
  const issued=current?null:await issueSession("customer",customerId);const order=await createOrder(customerId,input);
  let response;try{response=json(await hostedCheckout(order),201);}catch{response=json({orderId:order.id,error:"Your order was saved as unpaid, but Stripe could not be opened. Please retry from your order status page."},502);}
  if(issued)setSession(response,"customer",issued);return response;
}catch(error){return failure(error);}}
