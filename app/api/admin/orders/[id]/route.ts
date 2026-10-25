import { adminOrder } from "@/lib/commerce/admin";
import { fulfillmentSchema } from "@/lib/commerce/input";
import { updateFulfillment } from "@/lib/commerce/orders";
import { ApiError, failure, json, readJson, requireAdmin, sameOrigin } from "@/lib/commerce/security";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{await requireAdmin();return json({order:await adminOrder((await params).id)});}catch(error){return failure(error);}}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(request);const admin=await requireAdmin();const data=fulfillmentSchema.safeParse(await readJson(request));if(!data.success)throw new ApiError(400,"Invalid order update.");await updateFulfillment((await params).id,admin.id,data.data);return json({updated:true});}catch(error){return failure(error);}}
