import { customerOrder, publicOrder } from "@/lib/commerce/orders";
import { verifySession } from "@/lib/commerce/stripe";
import { query } from "@/lib/commerce/db";
import { ApiError, failure, json, rateLimit, sameOrigin, session } from "@/lib/commerce/security";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(request);const current=await session("customer");if(!current)throw new ApiError(401,"Use the same browser that placed this order.");await rateLimit("payment-verify",current.subject_id,30,300);const {id}=await params;await customerOrder(id,current.subject_id);const attempt=(await query("SELECT session_id FROM store_checkout_attempts WHERE order_id=$1 AND session_id IS NOT NULL ORDER BY created_at DESC LIMIT 1",[id])).rows[0];if(attempt)await verifySession(attempt.session_id,`verified-${attempt.session_id}`,"server.session.verification");return json({order:publicOrder(await customerOrder(id,current.subject_id))});}catch(error){return failure(error);}}
