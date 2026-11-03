// Run with: node --test src/lib/direction.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { DIRECTION_WORDS, headingTo } from "./direction.js";

test("the two directions have generic words", () => {
  assert.equal(DIRECTION_WORDS.SOUTHBOUND.title, "Outbound");
  assert.equal(DIRECTION_WORDS.NORTHBOUND.title, "Inbound");
});

test("a bus heads to the second name of its route going outbound and the first coming back", () => {
  assert.equal(headingTo("Ortigas - Ayala", "SOUTHBOUND"), "Ayala");
  assert.equal(headingTo("Ortigas - Ayala", "NORTHBOUND"), "Ortigas");
});

test("no destination when the direction is unknown or the name has no two ends", () => {
  assert.equal(headingTo("Ortigas - Ayala", null), null);
  assert.equal(headingTo("Express", "SOUTHBOUND"), null);
  assert.equal(headingTo(undefined, "SOUTHBOUND"), null);
});
