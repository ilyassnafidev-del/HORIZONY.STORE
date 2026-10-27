import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Stripe from 'stripe';
import { validConfiguredPrice, validConfiguredWebhook, requiredPaymentEvents } from '../lib/commerce/readiness.ts';
import { PGlite } from '@electric-sql/pglite';
import { addressFormat, countryOptions, shippingSchema, strongPassword, fulfillmentSchema } from '../lib/commerce/input.ts';
import { paymentLinks, priceAmounts, checkoutReady, publicCheckoutConfig, shippingCountries } from '../lib/commerce/settings.ts';
import { snapshotItems, expectedStripeLines, validPaidSession } from '../lib/commerce/order-model.ts';
import { createOrder, customerOrder, recordVerifiedPayment, updateFulfillment } from '../lib/commerce/orders.ts';
import { hashPassword, checkPassword, csvCell } from '../lib/commerce/crypto.ts';
import { sameOrigin, readJson, boundedBody } from '../lib/commerce/security.ts';
import { settlePaidOrder } from '../lib/cart.ts';
import { query, type Sql, transaction } from '../lib/commerce/db.ts';
const ids=Object.fromEntries(priceAmounts.map(amount=>[amount,`price_fixture_${amount}`]));
const address={firstName:'Test',lastName:'Customer',email:'',phone:'+12025550123',country:'US',region:'NY',city:'New York',street:'1 Example Street',unit:'',postal:'10001'};

test('production readiness rejects mismatched live prices and webhook destinations',()=>{
 const price={active:true,currency:'usd',unit_amount:100,type:'one_time' as const,livemode:true};
 assert.equal(validConfiguredPrice(price,100,true),true);
 for(const wrong of [{...price,currency:'eur'},{...price,unit_amount:1495},{...price,livemode:false},{...price,active:false}])assert.equal(validConfiguredPrice(wrong,100,true),false);
 const endpoint={url:'https://horizony.store/api/stripe/webhook/',status:'enabled' as const,livemode:true,enabled_events:requiredPaymentEvents as Stripe.WebhookEndpoint['enabled_events']};
 assert.equal(validConfiguredWebhook(endpoint,'https://horizony.store',true),true);
 assert.equal(validConfiguredWebhook({...endpoint,url:'https://unrelated.example/api/stripe/webhook/'},'https://horizony.store',true),false);
 assert.equal(validConfiguredWebhook({...endpoint,livemode:false},'https://horizony.store',true),false);
 assert.equal(validConfiguredWebhook({...endpoint,enabled_events:['checkout.session.completed']},'https://horizony.store',true),false);
});

test('all five exact supplied Stripe links are preserved and catalog prices are server-derived',()=>{
 assert.deepEqual(Object.keys(paymentLinks).map(Number).sort((a,b)=>a-b),[100,1495,2995,4495,5995]);
 assert.equal(paymentLinks[100],'https://buy.stripe.com/cNi3cv2kd2db3lq25l4gg04');
 assert.equal(paymentLinks[1495],'https://buy.stripe.com/eVq6oHaQJ3hf1di39p4gg00');
 assert.equal(paymentLinks[2995],'https://buy.stripe.com/cNifZh5wp4lj9JO39p4gg01');
 assert.equal(paymentLinks[4495],'https://buy.stripe.com/14AeVd3ohaJH9JOdO34gg02');
 assert.equal(paymentLinks[5995],'https://buy.stripe.com/dRmbJ10c54lj09e7pF4gg03');
 const items=snapshotItems([{productId:'21',size:'One size',quantity:2},{productId:'1',size:'S',quantity:1}],ids);
 assert.equal(items.reduce((sum,item)=>sum+item.unitCents*item.quantity,0),1695);
 assert.throws(()=>snapshotItems([{productId:'21',size:'S',quantity:1}],ids));
 assert.throws(()=>snapshotItems([{productId:'1',size:'S',quantity:26}],ids));
 assert.throws(()=>snapshotItems([{productId:'fake',size:'S',quantity:1}],ids));
});
test('country/address rules adapt without requiring US states for every country',()=>{
 assert.ok(countryOptions.length>=249);assert.equal(shippingSchema.safeParse(address).success,true);
 assert.equal(shippingSchema.safeParse({...address,region:''}).success,false);
 assert.equal(shippingSchema.safeParse({...address,phone:'2025550123'}).success,false);
 assert.equal(shippingSchema.safeParse({...address,country:'FR',region:'',city:'Paris',postal:'75001'}).success,true);
 assert.equal(shippingSchema.safeParse({...address,country:'GB',region:'',city:'London',postal:'SW1A 1AA'}).success,true);
 assert.equal(shippingSchema.safeParse({...address,country:'IE',region:'',city:'Dublin',postal:''}).success,true);
 assert.equal(addressFormat('US').regionRequired,true);assert.equal(addressFormat('GB').regionRequired,false);
 assert.equal(shippingSchema.safeParse({...address,cardNumber:'not-accepted'}).success,false);
});
test('checkout remains disabled without private configuration and initial supported rates are free',async()=>{
 const enabled=process.env.CHECKOUT_ENABLED;const db=process.env.DATABASE_URL;const destinations=process.env.SHIPPING_COUNTRIES;
 delete process.env.CHECKOUT_ENABLED;delete process.env.DATABASE_URL;
 try{assert.equal(checkoutReady(),false);const config=await publicCheckoutConfig();assert.equal(config.available,false);for(const code of ['US','CA','AU','GB','FR','DE'])assert.ok(config.countries.some(c=>c.code===code&&c.shippingCents===0));assert.ok(!config.countries.some(c=>c.code==='JP'));process.env.SHIPPING_COUNTRIES='US,JP,BR';assert.deepEqual(shippingCountries().map(c=>c.code),['US']);}finally{if(destinations===undefined)delete process.env.SHIPPING_COUNTRIES;else process.env.SHIPPING_COUNTRIES=destinations;if(enabled!==undefined)process.env.CHECKOUT_ENABLED=enabled;if(db!==undefined)process.env.DATABASE_URL=db;}
});
test('password hashing is salted, weak passwords fail strength checks, and CSV exports resist formulas',async()=>{
 const first=await hashPassword('Fixture-Only-Phrase-73!');const second=await hashPassword('Fixture-Only-Phrase-73!');
 assert.notEqual(first,second);assert.ok(await checkPassword('Fixture-Only-Phrase-73!',first));assert.equal(await checkPassword('wrong',first),false);
 assert.equal(strongPassword('short'),false);assert.equal(strongPassword('Fixture-Only-Phrase-73!'),true);
 assert.equal(csvCell('=SUM(A1:A2)'),`"'=SUM(A1:A2)"`);assert.equal(csvCell('+12025550123'),`"'+12025550123"`);
 assert.equal(fulfillmentSchema.safeParse({paymentStatus:'PAID'}).success,false);
});
test('same-origin and bounded-body protections reject cross-site and oversized requests',async()=>{
 const origin=process.env.APP_URL||'https://horizony.store';
 assert.doesNotThrow(()=>sameOrigin(new Request(origin,{method:'POST',headers:{origin}})));
 assert.throws(()=>sameOrigin(new Request(origin,{method:'POST',headers:{origin:'https://unrelated.example'}})));
 await assert.rejects(()=>readJson(new Request(origin,{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(33000)})));
 await assert.rejects(()=>boundedBody(new Request(origin,{method:'POST',body:'x'.repeat(20)}),10));
});
test('Stripe SDK rejects forged and modified webhook payloads',()=>{
 const stripe=new Stripe('fixture-not-an-api-key');const secret=randomUUID();
 const payload=JSON.stringify({id:'evt_fixture',type:'checkout.session.completed',data:{object:{id:'cs_fixture'}}});
 const signature=stripe.webhooks.generateTestHeaderString({payload,secret});
 assert.equal(stripe.webhooks.constructEvent(payload,signature,secret).id,'evt_fixture');
 assert.throws(()=>stripe.webhooks.constructEvent(payload+' ',signature,secret));
 assert.throws(()=>stripe.webhooks.constructEvent(payload,signature,randomUUID()));
});
test('paid cart settlement subtracts only purchased quantities and is idempotent',()=>{
 const state={lines:[{productId:'21',size:'One size' as const,quantity:3},{productId:'1',size:'S' as const,quantity:2}],consumed:[] as string[]};
 const paid=settlePaidOrder(state,'order-fixture',[{productId:'21',size:'One size',quantity:1}]);assert.equal(paid.lines[0].quantity,2);assert.equal(paid.lines[1].quantity,2);
 assert.equal(settlePaidOrder(paid,'order-fixture',[{productId:'21',size:'One size',quantity:1}]),paid);
});
test('real PostgreSQL order creation, isolation, payment idempotency, fulfillment and persistence',async()=>{
 const folder=await mkdtemp(path.join(tmpdir(),'horizony-db-test-'));let db=new PGlite();
 const previousIds=Object.fromEntries(priceAmounts.map(amount=>[amount,process.env[`STRIPE_PRICE_${amount}`]]));
 for(const amount of priceAmounts)process.env[`STRIPE_PRICE_${amount}`]=ids[amount];
 try{
  await db.exec(await readFile(new URL('../db/schema.sql',import.meta.url),'utf8'));
  const runQuery=db.query.bind(db) as unknown as typeof query;
  const destinations=async()=>[{...countryOptions.find(c=>c.code==='US')!,shippingCents:0,enabled:true}];
  const customer=randomUUID();const requestId=randomUUID();
  const input={requestId,shipping:address,items:[{productId:'21',size:'One size',quantity:1},{productId:'1',size:'S',quantity:1}]};
  const order=await createOrder(customer,input,runQuery,destinations);
  assert.equal(order.test_mode,!process.env.STRIPE_SECRET_KEY?.includes('_live_'));assert.equal(order.payment_status,'PENDING');await db.query("UPDATE store_orders SET payment_status='FAILED' WHERE id=$1",[order.id]);await db.query("UPDATE store_orders SET payment_status='CANCELED' WHERE id=$1",[order.id]);await db.query("UPDATE store_orders SET payment_status='PENDING' WHERE id=$1",[order.id]);assert.equal(order.total,1595);assert.equal(order.shipping_cents,0);
  assert.equal((await createOrder(customer,input,runQuery,destinations)).id,order.id);
  await assert.rejects(()=>createOrder(customer,{...input,shipping:{...address,city:'Changed'}},runQuery,destinations));
  await assert.rejects(()=>customerOrder(order.id,randomUUID(),runQuery));
  assert.equal((await customerOrder(order.id,customer,runQuery)).shipping.phone,address.phone);
  const transact=(async(fn:(sql:Sql)=>Promise<unknown>)=>{await db.exec('BEGIN');try{const result=await fn(db as unknown as Sql);await db.exec('COMMIT');return result;}catch(error){await db.exec('ROLLBACK');throw error;}}) as typeof transaction;
  const admin=randomUUID();await db.query('INSERT INTO store_admins(id,username,password_hash) VALUES($1,$2,$3)',[admin,'Fixture owner',await hashPassword('Fixture-Only-Phrase-73!')]);
  await assert.rejects(()=>updateFulfillment(order.id,admin,{fulfillment:'SHIPPED'},transact));
  const session={id:'cs_fixture',client_reference_id:order.id,metadata:{order_id:order.id},currency:'usd',payment_status:'paid',status:'complete',amount_subtotal:1595,amount_total:1595,total_details:{amount_shipping:0,amount_discount:0,amount_tax:0}};
  const lines=expectedStripeLines(order.items);
  assert.ok(validPaidSession(order,session,lines));
  assert.equal(validPaidSession(order,{...session,payment_status:'unpaid'},lines),false);
  assert.equal(validPaidSession(order,{...session,client_reference_id:randomUUID()},lines),false);
  assert.equal(validPaidSession(order,{...session,amount_total:100},lines),false);
  assert.equal(validPaidSession(order,{...session,currency:'eur'},lines),false);
  assert.equal(validPaidSession(order,session,[{price:'price_wrong_fixture',quantity:1}]),false);
  await transact(async sql=>{assert.equal(await recordVerifiedPayment(sql,'evt_fixture_paid','fixture.verified',order.id,1595,'pi_fixture'),true);assert.equal(await recordVerifiedPayment(sql,'evt_fixture_paid','fixture.verified',order.id,1595,'pi_fixture'),false);});
  assert.equal((await db.query<{count:number}>('SELECT count(*)::int AS count FROM store_payment_events')).rows[0].count,1);
  await updateFulfillment(order.id,admin,{fulfillment:'SHIPPED',note:'Fixture shipment note'},transact);
  const saved=(await customerOrder(order.id,customer,runQuery));assert.equal(saved.payment_status,'PAID');assert.equal(saved.fulfillment,'SHIPPED');
  const archive=await db.dumpDataDir();const archivePath=path.join(folder,'database.tar.gz');await writeFile(archivePath,Buffer.from(await archive.arrayBuffer()));await db.close();db=new PGlite({loadDataDir:new Blob([await readFile(archivePath)])});
  const persisted=(await db.query<{payment_status:string;paid_at:string}>('SELECT payment_status,paid_at FROM store_orders WHERE id=$1',[order.id])).rows[0];
  assert.equal(persisted.payment_status,'PAID');assert.ok(persisted.paid_at);
 }finally{for(const amount of priceAmounts){const previous=previousIds[amount];if(previous===undefined)delete process.env[`STRIPE_PRICE_${amount}`];else process.env[`STRIPE_PRICE_${amount}`]=previous;}await db.close();assert.equal(path.dirname(path.resolve(folder)),path.resolve(tmpdir()));assert.match(path.basename(folder),/^horizony-db-test-/);await rm(folder,{recursive:true,force:true});}
});
