import { Pool, type PoolClient, type QueryResultRow } from "pg";
let pool:Pool|undefined;
export function database() {
  if(!process.env.DATABASE_URL)throw Error("DATABASE_NOT_CONFIGURED");
  if(!pool){
    const url=new URL(process.env.DATABASE_URL);
    const local=["localhost","127.0.0.1","::1"].includes(url.hostname);
    for(const key of ["sslmode","sslcert","sslkey","sslrootcert"])url.searchParams.delete(key);
    const requestedMax=Number(process.env.DATABASE_POOL_MAX||8);
    const max=Number.isInteger(requestedMax)&&requestedMax>=1&&requestedMax<=20?requestedMax:8;
    pool=new Pool({connectionString:url.toString(),max,idleTimeoutMillis:30000,connectionTimeoutMillis:8000,
      ssl:local&&process.env.DATABASE_SSL==="false"?false:{rejectUnauthorized:true,...(process.env.DATABASE_CA_CERT?{ca:process.env.DATABASE_CA_CERT.replaceAll("\\n","\n")}: {})}});
  }
  return pool;
}
export type Sql = Pick<PoolClient,"query">;
export async function transaction<T>(fn:(sql:Sql)=>Promise<T>):Promise<T>{const sql=await database().connect();try{await sql.query("BEGIN");const result=await fn(sql);await sql.query("COMMIT");return result;}catch(error){await sql.query("ROLLBACK");throw error;}finally{sql.release();}}
export async function query<T extends QueryResultRow=QueryResultRow>(text:string,values?:unknown[]){return database().query<T>(text,values);}
