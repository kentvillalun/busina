// Run with: node --test src/lib/seatLayout.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_ROWS, rowSize, seatSlot } from "./seatLayout.js";

test("a 4-seat bus is 2 by 2: seat 1 front right, seat 2 front left, seats 3 and 4 behind them", () => {
  const front = MAX_ROWS - 1;
  assert.equal(rowSize(4), 2);
  assert.deepEqual([0, 1, 2, 3].map((i) => seatSlot(i, 4)), [
    { column: front, lane: 0 },
    { column: front, lane: 1 },
    { column: front - 1, lane: 0 },
    { column: front - 1, lane: 1 },
  ]);
});

test("a full bus has 4 seats per row, seat 1 front right and seat 40 at the rear left", () => {
  assert.equal(rowSize(40), 4);
  assert.deepEqual(seatSlot(0, 40), { column: MAX_ROWS - 1, lane: 0 });
  assert.equal(seatSlot(3, 40).column, MAX_ROWS - 1);
  assert.equal(seatSlot(4, 40).column, MAX_ROWS - 2);
  assert.deepEqual(seatSlot(39, 40), { column: 0, lane: 3 });
});

test("a bus of 6 seats uses the 4-per-row layout and fills the front two rows", () => {
  assert.equal(rowSize(6), 4);
  assert.equal(seatSlot(5, 6).column, MAX_ROWS - 2);
});
