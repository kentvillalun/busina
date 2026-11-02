// Run with: node --test src/utils/token.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { signCommuterToken, signStaffToken, verifyToken } from "./token.js";

process.env.JWT_SECRET = "test-secret-only-for-this-file";

test("a driver token says DRIVER and names the bus", () => {
  const payload = verifyToken(signStaffToken({ id: "bus-1" }));
  assert.equal(payload.role, "DRIVER");
  assert.equal(payload.busId, "bus-1");
});

test("a commuter token says COMMUTER, so the two portals can tell them apart", () => {
  assert.equal(verifyToken(signCommuterToken({ id: "c-1" })).role, "COMMUTER");
});

test("a driver token lasts one shift, not a week", () => {
  const { iat, exp } = verifyToken(signStaffToken({ id: "bus-1" }));
  assert.equal(exp - iat, 12 * 60 * 60);
});

test("a token signed with another secret is rejected", () => {
  const token = signStaffToken({ id: "bus-1" });
  process.env.JWT_SECRET = "another-secret";
  assert.throws(() => verifyToken(token), { name: "JsonWebTokenError" });
  process.env.JWT_SECRET = "test-secret-only-for-this-file";
});
