import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { query, transaction } from "./db.ts";
import { ApiError } from "./security.ts";
import { checkoutReady, checkoutServicesReady, origin } from "./settings.ts";
import { expectedStripeLines, validPaidSession, type Order } from "./order-model.ts";
import { recordVerifiedPayment } from "./orders.ts";

export function stripeClient(){if(!process.env.STRIPE_SECRET_KEY)throw new ApiError(503,"Payments are not configured.");return new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:2,timeout:15000});}
export async function hostedCheckout(order:Order){
  if(!checkoutReady()||!await checkoutServicesReady())throw new ApiError(503,"Online checkout is currently unavailable. Your unpaid order is saved.");
  const stripe=stripeClient();
  for(const item of expectedStripeLines(order.items)){
    const price=await stripe.prices.retrieve(item.price);const amount=order.items.find(line=>line.priceId===item.price)!.unitCents;
    if(!price.active||price.currency!=="usd"||price.unit_amount!==amount||price.type!=="one_time")throw new ApiError(503,"A product payment price needs review. Your order remains unpaid.");
  }
  const attempt=await transaction(async sql=>{
    const locked=(await sql.query<Order>("SELECT * FROM store_orders WHERE id=$1 FOR UPDATE",[order.id])).rows[0];
    if(["PAID","REFUNDED","PARTIALLY_REFUNDED"].includes(locked.payment_status))throw new ApiError(409,"This order already has a verified payment.");
    const previous=(await sql.query("SELECT * FROM store_checkout_attempts WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1",[order.id])).rows[0];
    if(previous&&(previous.status==="CREATING"||previous.status==="OPEN")&&Date.now()-new Date(previous.created_at).getTime()<23*3600000&&(!previous.expires_at||new Date(previous.expires_at).getTime()>Date.now()))return previous;
    const created=(await sql.query("INSERT INTO store_checkout_attempts(id,order_id) VALUES($1,$2) RETURNING *",[randomUUID(),order.id])).rows[0];return created;
  });
  if(attempt.session_id&&attempt.stripe_url)return {url:attempt.stripe_url,orderId:order.id};
  const shipping=order.shipping;
  const address={country:shipping.country,line1:shipping.street,line2:shipping.unit||undefined,city:shipping.city||undefined,state:shipping.region||undefined,postal_code:shipping.postal||undefined};
  const customer=await stripe.customers.create({name:`${shipping.firstName} ${shipping.lastName}`,phone:shipping.phone,email:shipping.email||undefined,address,shipping:{name:`${shipping.firstName} ${shipping.lastName}`,phone:shipping.phone,address}}, {idempotencyKey:`customer-${order.id}`});
  const session=await stripe.checkout.sessions.create({mode:"payment",customer:customer.id,client_reference_id:order.id,
    metadata:{order_id:order.id},payment_intent_data:{metadata:{order_id:order.id}},line_items:expectedStripeLines(order.items),
    automatic_tax:{enabled:true},allow_promotion_codes:false,
    shipping_options:[{shipping_rate_data:{type:"fixed_amount",fixed_amount:{amount:order.shipping_cents,currency:"usd"},display_name:order.shipping_cents===0?"Free Shipping":"Shipping"}}],
    success_url:`${origin()}/order-status/${order.id}/?return=success`,cancel_url:`${origin()}/order-status/${order.id}/?return=canceled`,
  },{idempotencyKey:`checkout-${attempt.id}`});
  if(!session.url||new URL(session.url).protocol!=="https:"||new URL(session.url).hostname!=="checkout.stripe.com")throw new ApiError(503,"Stripe checkout could not be opened. Your order remains unpaid.");
  await query("UPDATE store_orders SET payment_status='PENDING' WHERE id=$1 AND paid_at IS NULL",[order.id]);
  await query("UPDATE store_checkout_attempts SET session_id=$2,stripe_url=$3,status='OPEN',expires_at=to_timestamp($4) WHERE id=$1",[attempt.id,session.id,session.url,session.expires_at]);
  return {url:session.url,orderId:order.id};
}
export async function verifySession(sessionId:string,eventId:string,eventType:string){
  const stripe=stripeClient();const session=await stripe.checkout.sessions.retrieve(sessionId,{expand:["payment_intent"]});
  const attempt=(await query("SELECT order_id FROM store_checkout_attempts WHERE session_id=$1",[session.id])).rows[0];if(!attempt)return false;
  if(session.livemode!==Boolean(process.env.STRIPE_SECRET_KEY?.includes("_live_")))throw new ApiError(400,"Stripe mode mismatch.");
  const items=await stripe.checkout.sessions.listLineItems(session.id,{limit:100});
  const lines=items.data.map(line=>({price:line.price?.id||"",quantity:line.quantity||0}));
  return transaction(async sql=>{
    const order=(await sql.query<Order>("SELECT * FROM store_orders WHERE id=$1 FOR UPDATE",[attempt.order_id])).rows[0];if(!order)return false;
    if(session.livemode===order.test_mode)throw new ApiError(400,"Order payment mode mismatch.");
    if(session.payment_status!=="paid"){
      const latest=(await sql.query("SELECT session_id FROM store_checkout_attempts WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1",[order.id])).rows[0];
      if(latest?.session_id!==session.id)return false;
      if(!["PAID","REFUNDED","PARTIALLY_REFUNDED"].includes(order.payment_status)){
        const status=(eventType==="checkout.session.async_payment_failed"||order.payment_status==="FAILED")?"FAILED":session.status==="expired"?"CANCELED":"PENDING";
        await sql.query("UPDATE store_orders SET payment_status=$2 WHERE id=$1",[order.id,status]);
        if(eventType==="checkout.session.async_payment_failed")await sql.query("UPDATE store_checkout_attempts SET status='FAILED' WHERE session_id=$1",[session.id]);
        if(session.status==="expired")await sql.query("UPDATE store_checkout_attempts SET status='EXPIRED' WHERE session_id=$1",[session.id]);
      }
      return false;
    }
    const intent=typeof session.payment_intent==="object"?session.payment_intent:null;
    if(items.has_more||!validPaidSession(order,session,lines)||!intent||intent.status!=="succeeded"||intent.currency!=="usd"||intent.amount_received!==session.amount_total)throw new ApiError(400,"Stripe payment does not match this order.");
    const updated=await recordVerifiedPayment(sql,eventId,eventType,order.id,session.amount_total!,intent.id);
    await sql.query("UPDATE store_checkout_attempts SET status='COMPLETE' WHERE session_id=$1",[session.id]);return updated;
  });
}
export async function handleStripeEvent(event:Stripe.Event){
  if(event.livemode!==Boolean(process.env.STRIPE_SECRET_KEY?.includes("_live_")))throw new ApiError(400,"Stripe mode mismatch.");
  if(["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","checkout.session.expired"].includes(event.type)){
    await verifySession((event.data.object as Stripe.Checkout.Session).id,event.id,event.type);
  }else if(event.type==="charge.refunded"){
    const charge=await stripeClient().charges.retrieve((event.data.object as Stripe.Charge).id);
    const intent=typeof charge.payment_intent==="string"?charge.payment_intent:charge.payment_intent?.id;if(!intent)return;
    await transaction(async sql=>{
      const order=(await sql.query<Order>("SELECT * FROM store_orders WHERE stripe_payment_intent=$1 FOR UPDATE",[intent])).rows[0];if(!order)return;
      if(charge.currency!=="usd"||charge.amount!==order.total||charge.amount_refunded>order.total||!charge.paid)throw new ApiError(400,"Refund does not match the order.");
      const inserted=await sql.query("INSERT INTO store_payment_events(id,event_type,order_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id",[event.id,event.type,order.id]);if(!inserted.rows.length)return;
      await sql.query("UPDATE store_orders SET refund_cents=GREATEST(refund_cents,$2),payment_status=CASE WHEN GREATEST(refund_cents,$2)=total THEN 'REFUNDED' WHEN GREATEST(refund_cents,$2)>0 THEN 'PARTIALLY_REFUNDED' ELSE payment_status END WHERE id=$1",[order.id,charge.amount_refunded]);
    });
  }
}
