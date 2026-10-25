import { test } from "node:test";
import assert from "node:assert/strict";
import { products, priceTiers, productSizes } from "../lib/catalog.ts";
import { normalizeCart, cartSubtotal } from "../lib/cart.ts";
import { money } from "../lib/config.ts";

test("all 20 garments retain the original four pricing tiers", () => {
  assert.deepEqual(Object.values(priceTiers), [1495, 2995, 4495, 5995]);
  const clothing = products.filter(p => p.category !== "accessories");
  assert.equal(clothing.length, 20);
  assert.deepEqual([...new Set(clothing.map(p => p.price))].sort((a,b) => a-b), [1495,2995,4495,5995]);
  const expected = [1495,2995,2995,2995,2995,1495,4495,4495,4495,1495,4495,5995,5995,4495,5995,5995,4495,4495,5995,2995];
  for (const [index, product] of clothing.entries()) {
    assert.equal(product.price, expected[index], product.name);
    assert.match(money(product.price), /^\$(14|29|44|59)\.95$/);
  }
});

test("persisted bags recalculate with current catalog prices rather than old stored prices", () => {
  const oldBag = JSON.parse('[{"productId":"1","size":"S","quantity":2,"price":4800},{"productId":"12","size":"XL","quantity":1,"price":18400}]');
  const lines = normalizeCart(oldBag, products);
  assert.equal(cartSubtotal(lines, products), 8985);
  assert.equal(money(cartSubtotal(lines, products)), "$89.85");
  const allProducts = normalizeCart(products.map(p => ({productId:p.id,size:productSizes(p)[0],quantity:1})), products);
  assert.equal(cartSubtotal(allProducts, products), 81000);
  assert.equal(money(cartSubtotal(allProducts, products)), "$810.00");
});

test("wristband stays exactly $1.00 through selection, persistence and quantity changes", () => {
  const wristband = products.find(p => p.slug === "horizony-essential-wristband")!;
  assert.equal(wristband.price, 100);
  assert.equal(wristband.category, "accessories");
  assert.equal(wristband.inventory, null, "No fabricated stock count");
  assert.equal(wristband.measurements, null, "No fabricated measurements");
  assert.deepEqual(productSizes(wristband), ["One size"]);
  const lines = normalizeCart(JSON.parse(JSON.stringify([{ productId: wristband.id, size: "One size", quantity: 1, price: 9999 }])), products);
  assert.equal(money(cartSubtotal(lines, products)), "$1.00");
  const three = normalizeCart([...lines, { productId: wristband.id, size: "One size", quantity: 2 }], products);
  assert.equal(money(cartSubtotal(three, products)), "$3.00");
  assert.deepEqual(normalizeCart([{productId:wristband.id, size:"S", quantity:1}],products),[]);
  const mixed = normalizeCart([...lines, { productId:"1", size:"S", quantity:1 }], products);
  assert.equal(money(cartSubtotal(mixed, products)), "$15.95");
});
