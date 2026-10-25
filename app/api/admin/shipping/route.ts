import { z } from "zod";
import { query } from "@/lib/commerce/db";
import { countryOptions } from "@/lib/commerce/input";
import { shippingOptions } from "@/lib/commerce/settings";
import { ApiError, failure, json, readJson, requireAdmin, sameOrigin } from "@/lib/commerce/security";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(){try{await requireAdmin();return json({countries:await shippingOptions()});}catch(error){return failure(error);}}
export async function POST(request:Request){try{sameOrigin(request);await requireAdmin();const data=z.object({country:z.string().refine(code=>countryOptions.some(c=>c.code===code)),cents:z.number().int().min(0).max(100000),enabled:z.boolean()}).strict().safeParse(await readJson(request));if(!data.success)throw new ApiError(400,"Enter a supported country and a valid USD shipping amount.");await query("INSERT INTO store_shipping_rates(country,cents,enabled) VALUES($1,$2,$3) ON CONFLICT(country) DO UPDATE SET cents=$2,enabled=$3,updated_at=now()",[data.data.country,data.data.cents,data.data.enabled]);return json({updated:true});}catch(error){return failure(error);}}
