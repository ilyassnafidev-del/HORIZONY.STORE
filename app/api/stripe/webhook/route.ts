import { stripeClient, handleStripeEvent } from "@/lib/commerce/stripe";
import { boundedBody, json } from "@/lib/commerce/security";
export const runtime="nodejs";
export async function POST(request:Request){
  if(!process.env.STRIPE_WEBHOOK_SECRET||!process.env.STRIPE_SECRET_KEY)return json({error:"Webhook is not configured."},503);
  const signature=request.headers.get("stripe-signature");if(!signature)return json({error:"Missing signature."},400);
  let body;try{body=await boundedBody(request,1048576);}catch{return json({error:"Payload too large."},413);}
  let event;try{event=stripeClient().webhooks.constructEvent(body,signature,process.env.STRIPE_WEBHOOK_SECRET);}catch{return json({error:"Invalid webhook signature."},400);}
  try{await handleStripeEvent(event);return json({received:true});}catch{return json({error:"Payment event could not be verified. Retry later."},503);}
}
