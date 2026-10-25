import { query } from "@/lib/commerce/db";
import { cookieName, failure, json, sameOrigin, session } from "@/lib/commerce/security";
export async function POST(request:Request){try{sameOrigin(request);const current=await session("admin");if(current)await query("DELETE FROM store_sessions WHERE token_hash=$1",[current.token_hash]);const response=json({loggedOut:true});response.cookies.set(cookieName("admin"),"",{path:"/",httpOnly:true,secure:true,sameSite:"strict",maxAge:0});return response;}catch(error){return failure(error);}}
