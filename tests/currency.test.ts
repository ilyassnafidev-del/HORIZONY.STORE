import { test } from "node:test";
import assert from "node:assert/strict";
import { money, siteConfig } from "../lib/config.ts";
test("USD prices preserve cents and always show two decimal places", () => {
  assert.equal(siteConfig.currency, "USD");
  assert.equal(money(1495), "$14.95");
  assert.equal(money(2995), "$29.95");
  assert.equal(money(4495), "$44.95");
  assert.equal(money(5995), "$59.95");
  assert.equal(money(0), "$0.00");
  assert.equal(money(80900), "$809.00");
});
