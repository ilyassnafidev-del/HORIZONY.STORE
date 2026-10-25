import { test } from "node:test";
import assert from "node:assert/strict";
import { products, sizes } from "../lib/catalog.ts";
import { cartSubtotal, normalizeCart } from "../lib/cart.ts";
test("catalog contains 21 unique products, with the 20 garments preserved", () => {
  assert.equal(products.length, 21);
  assert.equal(products.filter((p) => p.category === "t-shirts").length, 10);
  assert.equal(products.filter((p) => p.category === "jackets").length, 10);
  assert.equal(new Set(products.map((p) => p.slug)).size, 21);
  assert.equal(new Set(products.map((p) => p.sku)).size, 21);
});
test("all requested sizes available and every gallery has three distinct product-specific files", () => {
  assert.deepEqual(sizes, ["S", "L", "XL", "XXL"]);
  for (const p of products) {
    if (p.category !== "accessories") assert.deepEqual(Object.keys(p.inventory ?? {}), [...sizes]);
    if (p.inventory) assert.ok(sizes.every((s) => p.inventory![s] > 0));
    assert.equal(p.images.length, 3);
    assert.equal(new Set(p.images).size, 3);
    assert.ok(p.images.every((src) => src.includes(p.slug)));
    assert.ok(Number.isInteger(p.price) && p.price > 0);
  }
});
test("cart rejects corrupted and fabricated lines and ignores client prices", () => {
  const result = normalizeCart(
    [
      { productId: "1", size: "S", quantity: 2, price: 1 },
      { productId: "fake", size: "S", quantity: 2 },
      { productId: "1", size: "M", quantity: 2 },
      { productId: "1", size: "L", quantity: -1 },
      { productId: "1", size: "L", quantity: 1.5 },
      null,
    ],
    products,
  );
  assert.deepEqual(result, [{ productId: "1", size: "S", quantity: 2 }]);
  assert.equal(cartSubtotal(result, products), products[0].price * 2);
  assert.deepEqual(normalizeCart({}, products), []);
});
test("different sizes remain separate and duplicate selections merge within catalog stock limits", () => {
  const result = normalizeCart(
    [
      { productId: "1", size: "S", quantity: 2 },
      { productId: "1", size: "L", quantity: 1 },
      { productId: "1", size: "S", quantity: 3 },
      { productId: "2", size: "XXL", quantity: 1000 },
    ],
    products,
  );
  assert.deepEqual(result, [
    { productId: "1", size: "S", quantity: 5 },
    { productId: "1", size: "L", quantity: 1 },
    { productId: "2", size: "XXL", quantity: 25 },
  ]);
  assert.equal(
    cartSubtotal(result, products),
    products[0].price * 6 + products[1].price * 25,
  );
});
