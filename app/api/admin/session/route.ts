import { failure, json, requireAdmin } from "@/lib/commerce/security";
export const dynamic="force-dynamic"; export const runtime="nodejs";
export async function GET(){try{const admin=await requireAdmin(true);return json({username:admin.username,mustChangePassword:admin.must_change_password});}catch(error){return failure(error);}}
