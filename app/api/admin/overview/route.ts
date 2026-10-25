import { dashboard } from "@/lib/commerce/admin";
import { failure, json, requireAdmin } from "@/lib/commerce/security";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(){try{await requireAdmin();return json(await dashboard());}catch(error){return failure(error);}}
