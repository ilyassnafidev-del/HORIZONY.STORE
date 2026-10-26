import { query } from "./db.ts";
import { ApiError } from "./security.ts";
const statuses=["UNPAID","PENDING","FAILED","PAID","CANCELED","REFUNDED","PARTIALLY_REFUNDED"];
export async function adminOrders(url:URL,exporting=false){
 const search=(url.searchParams.get("q")||"").trim().slice(0,100);const status=(url.searchParams.get("status")||"").toUpperCase();
 const sort=({date:"created_at DESC",oldest:"created_at ASC",amount:"total DESC",status:"payment_status ASC,created_at DESC"} as Record<string,string>)[url.searchParams.get("sort")||"date"]||"created_at DESC";
 const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get("offset"))||0));
 const result=await query(`SELECT * FROM store_orders WHERE ($1='' OR id::text ILIKE $2 OR (shipping->>'firstName')||' '||(shipping->>'lastName') ILIKE $2 OR shipping->>'phone' ILIKE $2 OR shipping->>'country' ILIKE $2) AND ($3='' OR payment_status=$3 OR ($3='REFUNDED' AND payment_status='PARTIALLY_REFUNDED')) ORDER BY ${sort} LIMIT $4 OFFSET $5`,[search,`%${search}%`,statuses.includes(status)?status:"",exporting?10000:50,exporting?0:offset]);return result.rows;
}
export async function dashboard(){
 const testMode=Boolean(process.env.STRIPE_SECRET_KEY?.includes("_test_"));
 const summary=(await query("SELECT count(*)::int AS total_orders,count(*) FILTER(WHERE payment_status='PAID')::int AS paid_orders,count(*) FILTER(WHERE payment_status='UNPAID')::int AS unpaid_orders,count(*) FILTER(WHERE payment_status='PENDING')::int AS pending_orders,COALESCE(sum(total-refund_cents) FILTER(WHERE paid_at IS NOT NULL),0)::bigint AS revenue FROM store_orders WHERE test_mode=$1",[testMode])).rows[0];
 const sales=(await query("SELECT to_char(paid_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,sum(total-refund_cents)::bigint AS cents FROM store_orders WHERE paid_at>=now()-interval '30 days' AND test_mode=$1 GROUP BY day ORDER BY day",[testMode])).rows;
 const products=(await query("SELECT item->>'name' AS name,sum((item->>'quantity')::int)::bigint AS quantity,sum((item->>'unitCents')::int*(item->>'quantity')::int)::bigint AS cents FROM store_orders,jsonb_array_elements(items) AS item WHERE paid_at IS NOT NULL AND payment_status<>'REFUNDED' AND test_mode=$1 GROUP BY name ORDER BY quantity DESC LIMIT 10",[testMode])).rows;
 return {testMode,summary:{...summary,revenue:Number(summary.revenue)},sales:sales.map(row=>({...row,cents:Number(row.cents)})),products:products.map(row=>({...row,cents:Number(row.cents),quantity:Number(row.quantity)}))};
}
export async function adminOrder(id:string){const order=(await query("SELECT * FROM store_orders WHERE id=$1",[id])).rows[0];if(!order)throw new ApiError(404,"Order not found.");const notes=(await query("SELECT n.note,n.created_at,a.username FROM store_order_notes n JOIN store_admins a ON a.id=n.admin_id WHERE order_id=$1 ORDER BY created_at DESC",[id])).rows;return {...order,notes};}
