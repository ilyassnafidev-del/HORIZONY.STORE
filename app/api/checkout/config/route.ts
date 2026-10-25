import { publicCheckoutConfig } from "@/lib/commerce/settings";
import { json } from "@/lib/commerce/security";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(){try{return json(await publicCheckoutConfig());}catch{return json({available:false,countries:[]});}}
