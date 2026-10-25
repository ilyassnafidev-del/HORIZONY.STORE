import { readFile } from "node:fs/promises";
import { database, transaction } from "../lib/commerce/db.ts";
try{const schema=await readFile(new URL("../db/schema.sql",import.meta.url),"utf8");await transaction(async sql=>{await sql.query("SELECT pg_advisory_xact_lock(70144025)");await sql.query(schema);});console.log("HORIZONY database schema is ready.");}catch{console.error("Migration failed. Check the private database settings, TLS certificate and database permissions.");process.exitCode=1;}finally{if(process.env.DATABASE_URL)await database().end();}
