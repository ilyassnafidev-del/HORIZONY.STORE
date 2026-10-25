import { adminOrders } from "@/lib/commerce/admin";
import { failure, json, requireAdmin } from "@/lib/commerce/security";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(request:Request){try{await requireAdmin();return json({orders:await adminOrders(new URL(request.url))});}catch(error){return failure(error);}}
