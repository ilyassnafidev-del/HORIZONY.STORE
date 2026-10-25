import { customerOrder } from "@/lib/commerce/orders";
import { hostedCheckout } from "@/lib/commerce/stripe";
import { ApiError, failure, json, rateLimit, sameOrigin, session } from "@/lib/commerce/security";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(request);const current=await session("customer");if(!current)throw new ApiError(401,"Use the same browser that placed this order.");await rateLimit("payment-retry",current.subject_id,10,600);const {id}=await params;return json(await hostedCheckout(await customerOrder(id,current.subject_id)));}catch(error){return failure(error);}}
