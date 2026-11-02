// Run with: node --test src/lib/seatLayout.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_SEATS, rowSize, seatBox } from "./seatLayout.js";

const boxes = (count) => Array.from({ length: count }, (_, i) => seatBox(i, count));
const overlap = (a, b) => a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;

test("a 4-seat bus is 2 by 2 and spreads over the bus: seat 1 front right, seat 2 front left, seats 3 and 4 in the row behind", () => {
  const [one, two, three, four] = boxes(4);
  assert.equal(rowSize(4), 2);
  assert.equal(one.left, two.left); // same row
  assert.ok(one.top > two.top); // seat 1 is on the right-hand side (lower in the drawing)
  assert.equal(three.left, four.left);
  assert.ok(one.left - three.left > 100); // the rows are far apart, not bunched up
  assert.ok(three.top > four.top);
});

test("a full bus has 4 seats per row: seat 1 front right, seat 40 rear left", () => {
  const all = boxes(40);
  assert.equal(rowSize(40), 4);
  assert.ok(all.every((box) => box.left <= all[0].left)); // seat 1 is the front-most
  assert.ok(all.every((box) => box.left >= all[39].left)); // seat 40 the rear-most
  assert.ok(all[0].top > all[3].top && all[39].top === all[3].top);
  assert.equal(new Set(all.map((box) => box.left)).size, 10); // ten rows
});

test("for every seat count the seats stay inside the bus and never overlap", () => {
  for (let count = 1; count <= MAX_SEATS; count++) {
    const all = boxes(count);
    for (const box of all) assert.ok(box.left >= 9 && box.left + box.width <= 276.5 && box.top >= 8 && box.top + box.height <= 123, `count ${count}`);
    for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) assert.ok(!overlap(all[i], all[j]), `count ${count}: ${i + 1} and ${j + 1}`);
  }
});
