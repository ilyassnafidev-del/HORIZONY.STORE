import { customerOrder, publicOrder } from "@/lib/commerce/orders";
import { ApiError, failure, json, session } from "@/lib/commerce/security";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{const current=await session("customer");if(!current)throw new ApiError(401,"Use the same browser that placed this order.");const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))throw new ApiError(404,"Order not found.");return json({order:publicOrder(await customerOrder(id,current.subject_id))});}catch(error){return failure(error);}}
