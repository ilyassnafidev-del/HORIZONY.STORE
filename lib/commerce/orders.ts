import { randomUUID } from "node:crypto";
import { query, transaction, type Sql } from "./db.ts";
import { checkoutSchema } from "./input.ts";
import { ApiError } from "./security.ts";
import { tokenHash } from "./crypto.ts";
import { priceIds, shippingOptions } from "./settings.ts";
import { snapshotItems, type Order } from "./order-model.ts";

export async function createOrder(customerId:string,input:unknown,runQuery=query,getDestinations=shippingOptions){
  const validated=checkoutSchema.safeParse(input);if(!validated.success)throw new ApiError(400,validated.error.issues[0]?.message||"Check your order details.");
  const data=validated.data;const destination=(await getDestinations()).find(c=>c.code===data.shipping.country&&c.enabled);if(!destination)throw new ApiError(400,"Shipping is not available to this destination.");
  let items;try{items=snapshotItems(data.items,priceIds());}catch(error){throw new ApiError(400,(error as Error).message);}
  const subtotal=items.reduce((sum,line)=>sum+line.unitCents*line.quantity,0);const fingerprint=tokenHash(JSON.stringify({shipping:data.shipping,items}));
  const result=await runQuery<Order>("INSERT INTO store_orders(id,customer_id,request_key,request_hash,shipping,items,subtotal,shipping_cents,total,test_mode) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(customer_id,request_key) DO NOTHING RETURNING *",[randomUUID(),customerId,data.requestId,fingerprint,JSON.stringify(data.shipping),JSON.stringify(items),subtotal,destination.shippingCents,subtotal+destination.shippingCents,!process.env.STRIPE_SECRET_KEY?.includes("_live_")]);
  const order=result.rows[0]??(await runQuery<Order>("SELECT * FROM store_orders WHERE customer_id=$1 AND request_key=$2",[customerId,data.requestId])).rows[0];
  if(order.request_hash!==fingerprint)throw new ApiError(409,"This checkout reference was already used for different details. Refresh and try again.");return order;
}
export async function customerOrder(id:string,customerId:string,runQuery=query){if(!/^[a-f0-9-]{36}$/i.test(id))throw new ApiError(404,"Order not found.");const result=await runQuery<Order>("SELECT * FROM store_orders WHERE id=$1 AND customer_id=$2",[id,customerId]);if(!result.rows[0])throw new ApiError(404,"Order not found.");return result.rows[0];}
export function publicOrder(order:Order){return {id:order.id,shipping:order.shipping,items:order.items.map(({priceId:_,...line})=>line),subtotal:order.subtotal,shippingCents:order.shipping_cents,total:order.total,refundCents:order.refund_cents,paymentStatus:order.payment_status,testMode:order.test_mode,fulfillment:order.fulfillment,createdAt:order.created_at,paidAt:order.paid_at};}
export async function recordVerifiedPayment(sql:Sql,eventId:string,type:string,orderId:string,total:number,intent:string){
  const event=await sql.query("INSERT INTO store_payment_events(id,event_type,order_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id",[eventId,type,orderId]);if(!event.rows.length)return false;
  await sql.query("UPDATE store_orders SET payment_status=CASE WHEN payment_status IN ('REFUNDED','PARTIALLY_REFUNDED') THEN payment_status ELSE 'PAID' END,total=$2,stripe_payment_intent=$3,paid_at=COALESCE(paid_at,now()) WHERE id=$1",[orderId,total,intent]);return true;
}
export async function updateFulfillment(orderId:string,adminId:string,data:{fulfillment?:string;note?:string},transact=transaction){return transact(async sql=>{const result=await sql.query<Order>("SELECT * FROM store_orders WHERE id=$1 FOR UPDATE",[orderId]);const order=result.rows[0];if(!order)throw new ApiError(404,"Order not found.");if(data.fulfillment&&["SHIPPED","DELIVERED"].includes(data.fulfillment)&&!["PAID","PARTIALLY_REFUNDED"].includes(order.payment_status))throw new ApiError(409,"An unpaid or fully refunded order cannot be marked shipped or delivered.");if(data.fulfillment)await sql.query("UPDATE store_orders SET fulfillment=$2 WHERE id=$1",[orderId,data.fulfillment]);if(data.note)await sql.query("INSERT INTO store_order_notes(id,order_id,admin_id,note) VALUES($1,$2,$3,$4)",[randomUUID(),orderId,adminId,data.note]);});}
