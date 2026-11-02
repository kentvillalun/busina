// Run with: node --test src/lib/seatLayout.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_ROWS, seatSlot } from "./seatLayout.js";

test("seat 1 is in the front row and the last seat of a full bus is at the rear", () => {
  assert.deepEqual(seatSlot(0), { column: MAX_ROWS - 1, lane: 0 });
  assert.equal(seatSlot(3).column, MAX_ROWS - 1);
  assert.equal(seatSlot(4).column, MAX_ROWS - 2);
  assert.deepEqual(seatSlot(39), { column: 0, lane: 3 });
});

test("a 4-seat bus uses only the front row, one seat in each lane", () => {
  const slots = [0, 1, 2, 3].map(seatSlot);
  assert.deepEqual(new Set(slots.map((slot) => slot.column)), new Set([MAX_ROWS - 1]));
  assert.deepEqual(slots.map((slot) => slot.lane), [0, 1, 2, 3]);
});
