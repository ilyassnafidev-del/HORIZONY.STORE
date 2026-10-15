import { test } from "node:test";
import assert from "node:assert/strict";
import { products, priceTiers } from "../lib/catalog.ts";
import { normalizeCart, cartSubtotal } from "../lib/cart.ts";
import { money } from "../lib/config.ts";

test("all 20 products use exactly the four requested pricing tiers", () => {
  assert.deepEqual(Object.values(priceTiers), [1495, 2995, 4495, 5995]);
  assert.equal(products.length, 20);
  assert.deepEqual([...new Set(products.map(p => p.price))].sort((a,b) => a-b), [1495,2995,4495,5995]);
  const expected = [1495,2995,2995,2995,2995,1495,4495,4495,4495,1495,4495,5995,5995,4495,5995,5995,4495,4495,5995,2995];
  for (const [index, product] of products.entries()) {
    assert.equal(product.price, expected[index], product.name);
    assert.match(money(product.price), /^\$(14|29|44|59)\.95$/);
  }
});

test("persisted bags recalculate with current catalog prices rather than old stored prices", () => {
  const oldBag = JSON.parse('[{"productId":"1","size":"S","quantity":2,"price":4800},{"productId":"12","size":"XL","quantity":1,"price":18400}]');
  const lines = normalizeCart(oldBag, products);
  assert.equal(cartSubtotal(lines, products), 8985);
  assert.equal(money(cartSubtotal(lines, products)), "$89.85");
  const allProducts = normalizeCart(products.map(p => ({productId:p.id,size:"L",quantity:1})), products);
  assert.equal(cartSubtotal(allProducts, products), 80900);
  assert.equal(money(cartSubtotal(allProducts, products)), "$809.00");
});
