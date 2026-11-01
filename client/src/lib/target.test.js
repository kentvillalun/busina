// Run with: node --test src/lib/target.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { targetMode } from "./target.js";

const spot = { lat: 18.2, lng: 120.6 };

test("the commuter's own choice wins, whatever is saved", () => {
  assert.equal(targetMode("location", spot), "location");
  assert.equal(targetMode("spot", spot), "spot");
  assert.equal(targetMode("spot", null), "spot"); // no spot to measure to: the ETA falls back to the position in the page
});

test("without a choice, a saved spot is used, otherwise the location", () => {
  assert.equal(targetMode(null, spot), "spot"); // nothing changes for people who already have a spot
  assert.equal(targetMode(null, null), "location");
  assert.equal(targetMode(undefined, null), "location");
});

test("anything unexpected in storage is ignored", () => {
  assert.equal(targetMode("home", spot), "spot");
  assert.equal(targetMode(5, null), "location");
});
