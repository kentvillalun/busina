// Run with: node --test src/utils/operatorUser.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { canOperate } from "./operatorUser.js";

const operator = { role: "OPERATOR", active: true, passwordHash: "$2a$10$hash" };

test("an active operator with a password may operate", () => {
  assert.equal(canOperate(operator), true);
});

test("a driver account, a disabled account and an account without a password may not", () => {
  assert.equal(canOperate({ ...operator, role: "DRIVER" }), false);
  assert.equal(canOperate({ ...operator, active: false }), false);
  assert.equal(canOperate({ ...operator, passwordHash: null }), false);
});

test("no user at all may not", () => {
  assert.equal(canOperate(null), false);
  assert.equal(canOperate(undefined), false);
});
