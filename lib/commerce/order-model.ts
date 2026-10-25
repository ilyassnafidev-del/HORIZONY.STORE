import { products, productSizes, quantityLimit, type Size } from "../catalog.ts";
export type OrderItem={productId:string;name:string;size:Size;quantity:number;unitCents:number;image:string;priceId:string};
export type Order={id:string;customer_id:string;request_key:string;request_hash:string;shipping:Record<string,string>;items:OrderItem[];subtotal:number;shipping_cents:number;total:number;refund_cents:number;test_mode:boolean;payment_status:string;fulfillment:string;stripe_payment_intent:string|null;created_at:string;paid_at:string|null};
export function snapshotItems(items:{productId:string;size:string;quantity:number}[],ids:Record<number,string>):OrderItem[]{
  const result:OrderItem[]=[];
  for(const line of items){const product=products.find(p=>p.id===line.productId);if(!product||!productSizes(product).includes(line.size as Size)||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>quantityLimit(product,line.size as Size))throw Error("Invalid product, selection or quantity.");
    const existing=result.find(item=>item.productId===line.productId&&item.size===line.size);
    if(existing){existing.quantity+=line.quantity;if(existing.quantity>quantityLimit(product,line.size as Size))throw Error("Quantity exceeds the allowed limit.");}
    else result.push({productId:product.id,name:product.name,size:line.size as Size,quantity:line.quantity,unitCents:product.price,image:product.images[0],priceId:ids[product.price]});
  }
  if(!result.length||result.reduce((sum,line)=>sum+line.quantity,0)>99)throw Error("Choose between 1 and 99 items per order.");
  return result;
}
export function expectedStripeLines(items:OrderItem[]){const grouped=new Map<string,number>();for(const line of items)grouped.set(line.priceId,(grouped.get(line.priceId)??0)+line.quantity);return [...grouped].map(([price,quantity])=>({price,quantity}));}
export function validPaidSession(order:Order,session:{id:string;client_reference_id:string|null;metadata:Record<string,string>|null;currency:string|null;payment_status:string;status:string|null;amount_subtotal:number|null;amount_total:number|null;total_details:{amount_shipping:number|null;amount_discount:number|null;amount_tax:number|null}|null},lines:{price:string;quantity:number}[]){
  const expected=expectedStripeLines(order.items).sort((a,b)=>a.price.localeCompare(b.price));const actual=lines.sort((a,b)=>a.price.localeCompare(b.price));
  const base=order.subtotal+order.shipping_cents;
  return session.client_reference_id===order.id&&session.metadata?.order_id===order.id&&session.currency==="usd"&&session.payment_status==="paid"&&session.status==="complete"&&session.amount_subtotal===order.subtotal&&session.total_details?.amount_shipping===order.shipping_cents&&session.total_details.amount_discount===0&&session.total_details.amount_tax!==null&&session.total_details.amount_tax>=0&&session.amount_total!==null&&session.amount_total>=base&&session.amount_total<=base+session.total_details.amount_tax&&JSON.stringify(expected)===JSON.stringify(actual);
}
