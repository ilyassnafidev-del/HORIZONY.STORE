import { randomUUID } from "node:crypto";
import { database, query, transaction } from "../lib/commerce/db.ts";
import { hashPassword } from "../lib/commerce/crypto.ts";
import { strongPassword } from "../lib/commerce/input.ts";

function hiddenPassword(label:string){return new Promise<string>((resolve,reject)=>{
 if(!process.stdin.isTTY){reject(Error("Use an interactive terminal."));return;}
 process.stdout.write(label);process.stdin.setRawMode(true);process.stdin.resume();let password="";
 const listener=(data:Buffer)=>{for(const char of data.toString("utf8")){
  if(char==="\u0003"){cleanup();reject(Error("Cancelled."));return;}
  if(char==="\r"||char==="\n"){cleanup();resolve(password);return;}
  if(char==="\u007f"||char==="\b")password=password.slice(0,-1);
  else if(char>=" "&&password.length<1024)password+=char;
 }};
 function cleanup(){process.stdin.off("data",listener);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write("\n");}
 process.stdin.on("data",listener);
});}

async function confirmedPassword(){
 while(true){
  const password=await hiddenPassword("New admin password (hidden): ");
  if(!strongPassword(password)){console.log("Use at least 14 characters including uppercase, lowercase, a number and a symbol.");continue;}
  if(await hiddenPassword("Confirm password (hidden): ")!==password){console.log("Passwords did not match. Try again.");continue;}
  return password;
 }
}

// Opt-in verification uses real HTTPS login and protected orders. Never log credentials or customer rows.
async function verifyProduction(password:string){
 const origin=new URL(process.env.APP_URL||"https://horizony.store").origin;
 if(origin!=="https://horizony.store")throw Error("Verify production only at https://horizony.store.");
 const login=await fetch(`${origin}/api/admin/login/`,{method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify({username:"Ilyass",password}),signal:AbortSignal.timeout(15000)});
 if(!login.ok)throw Error(`Production login check failed (HTTP ${login.status}).`);
 const cookie=login.headers.getSetCookie().map(value=>value.split(";")[0]).join("; ");
 if(!cookie)throw Error("Production login did not issue a session.");
 try{
  const orders=await fetch(`${origin}/api/admin/orders/`,{headers:{Cookie:cookie},signal:AbortSignal.timeout(15000)});
  await orders.body?.cancel();
  if(!orders.ok)throw Error(`Production order access check failed (HTTP ${orders.status}).`);
  console.log("PASS: production login and protected customer-order access (HTTP 200).");
 }finally{
  await fetch(`${origin}/api/admin/logout/`,{method:"POST",headers:{Cookie:cookie,Origin:origin},signal:AbortSignal.timeout(15000)}).then(response=>response.body?.cancel()).catch(()=>{});
 }
}

try{
 if(!process.env.DATABASE_URL)throw Error("Database is not configured.");
 const finalPassword=process.argv.includes("--final-password");const verify=process.argv.includes("--verify-production");
 if(verify&&!finalPassword)throw Error("Production verification requires --final-password.");
 const existing=await query("SELECT id FROM store_admins WHERE lower(username)=lower($1)",["Ilyass"]);
 if(existing.rows.length&&!process.argv.includes("--reset"))throw Error("Account already exists. Use --reset only for an intentional password reset.");
 console.log("Use at least 14 characters including uppercase, lowercase, a number and a symbol. Input is hidden.");
 const password=await confirmedPassword();const hash=await hashPassword(password);
 await transaction(async sql=>{
  const id=existing.rows[0]?.id||randomUUID();
  if(existing.rows.length)await sql.query("UPDATE store_admins SET password_hash=$2,must_change_password=$3 WHERE id=$1",[id,hash,!finalPassword]);
  else await sql.query("INSERT INTO store_admins(id,username,password_hash,must_change_password) VALUES($1,$2,$3,$4)",[id,"Ilyass",hash,!finalPassword]);
  await sql.query("DELETE FROM store_sessions WHERE kind='admin' AND subject_id=$1",[id]);
 });
 console.log(finalPassword?"Ilyass is configured with your privately chosen, confirmed production password.":"Ilyass is configured. Sign in and change the setup password before accessing the dashboard.");
 if(verify)await verifyProduction(password);
}catch(error){
 const message=(error as Error).message;
 console.error(/^(Account already|Production |Verify production|Use an interactive|Cancelled)/.test(message)?message:"Admin setup failed. Check private database settings and terminal access. No credentials are printed.");process.exitCode=1;
}finally{if(process.env.DATABASE_URL)await database().end();}
