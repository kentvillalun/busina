// Run with: node --test src/lib/vapidKey.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { urlBase64ToBytes } from "./vapidKey.js";

test("decodes URL-safe base64 with and without padding", () => {
  assert.deepEqual([...urlBase64ToBytes("AQID")], [1, 2, 3]);
  assert.deepEqual([...urlBase64ToBytes("AQI")], [1, 2]); // padding is added back
  assert.deepEqual([...urlBase64ToBytes("-_8")], [251, 255]); // "-" and "_" stand for "+" and "/"
});

test("a VAPID public key (87 characters) becomes 65 bytes", () => {
  const key = "B" + "A".repeat(86); // shape only: 87 URL-safe base64 characters
  const bytes = urlBase64ToBytes(key);
  assert.equal(bytes.length, 65);
});
