import { randomBytes } from "node:crypto";
import { tokenHash } from "./crypto.ts";
import { cookies } from "next/headers.js";
import { NextResponse } from "next/server.js";
import { query } from "./db.ts";
import { origin } from "./settings.ts";
export class ApiError extends Error {status:number;code?:string;constructor(status:number,message:string,code?:string){super(message);this.status=status;this.code=code;}}
export function sameOrigin(request:Request){if(request.headers.get("origin")!==origin())throw new ApiError(403,"Request origin rejected.");}
export async function boundedBody(request:Request,max:number){const reader=request.body?.getReader();if(!reader)return "";const chunks:Uint8Array[]=[];let size=0;try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>max){await reader.cancel();throw new ApiError(413,"Request too large.");}chunks.push(part.value);}return Buffer.concat(chunks).toString("utf8");}finally{reader.releaseLock();}}
export async function readJson(request:Request){if(!request.headers.get("content-type")?.startsWith("application/json"))throw new ApiError(415,"Use JSON.");const body=await boundedBody(request,32000);try{return JSON.parse(body);}catch{throw new ApiError(400,"Invalid JSON.");}}
export function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store","Vary":"Cookie"}});}
export function failure(error:unknown){if(error instanceof ApiError)return json({error:error.message,code:error.code},error.status);return json({error:"The service is temporarily unavailable. Please try again or contact HORIZONY on WhatsApp."},503);}
export function cookieName(kind:"admin"|"customer"){return `${origin().startsWith("https:")?"__Host-":""}horizony-${kind}`;}
export async function session(kind:"admin"|"customer"){
  const token=(await cookies()).get(cookieName(kind))?.value;if(!token||!/^[a-f0-9]{64}$/.test(token)||!process.env.DATABASE_URL)return null;
  const result=await query("SELECT * FROM store_sessions WHERE token_hash=$1 AND kind=$2 AND expires_at>now()",[tokenHash(token),kind]);return result.rows[0]??null;
}
export async function issueSession(kind:"admin"|"customer",subject:string){const token=randomBytes(32).toString("hex");const seconds=kind==="admin"?8*3600:30*86400;await query("INSERT INTO store_sessions(token_hash,kind,subject_id,expires_at) VALUES($1,$2,$3,now()+$4*interval '1 second')",[tokenHash(token),kind,subject,seconds]);return {token,seconds};}
export function setSession(response:NextResponse,kind:"admin"|"customer",value:{token:string;seconds:number}){response.cookies.set(cookieName(kind),value.token,{httpOnly:true,secure:origin().startsWith("https:"),sameSite:kind==="admin"?"strict":"lax",path:"/",maxAge:value.seconds});}
export async function requireAdmin(allowPasswordChange=false){const current=await session("admin");if(!current)throw new ApiError(401,"Sign in to continue.");const result=await query<{id:string;username:string;must_change_password:boolean}>("SELECT id,username,must_change_password FROM store_admins WHERE id=$1",[current.subject_id]);const admin=result.rows[0];if(!admin)throw new ApiError(401,"Sign in to continue.");if(admin.must_change_password&&!allowPasswordChange)throw new ApiError(403,"Change the setup password before accessing the dashboard.","PASSWORD_CHANGE_REQUIRED");return {...admin,sessionHash:current.token_hash};}
export async function rateLimit(scope:string,key:string,max:number,seconds:number){const bucket=Math.floor(Date.now()/1000/seconds);await query("DELETE FROM store_rate_limits WHERE scope=$1 AND bucket<$2",[scope,bucket-2]);const result=await query("INSERT INTO store_rate_limits(scope,key_hash,bucket,hits) VALUES($1,$2,$3,1) ON CONFLICT(scope,key_hash,bucket) DO UPDATE SET hits=store_rate_limits.hits+1 RETURNING hits",[scope,tokenHash(key),bucket]);if(result.rows[0].hits>max)throw new ApiError(429,"Too many attempts. Please try again later.");}
