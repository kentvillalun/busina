// Run with: node --test src/lib/target.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { alertPlan, targetMode } from "./target.js";

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

test("alertPlan: a saved spot in spot mode is used as before", () => {
  assert.deepEqual(alertPlan({ mode: "spot", hasSpot: true, hasPosition: false, onRoad: false }), { use: "spot" });
  assert.deepEqual(alertPlan({ mode: "spot", hasSpot: true, hasPosition: true, onRoad: true }), { use: "spot" });
});

test("alertPlan: on the road, the position is used, with or without a spot", () => {
  assert.deepEqual(alertPlan({ mode: "location", hasSpot: false, hasPosition: true, onRoad: true }), { use: "location" });
  assert.deepEqual(alertPlan({ mode: "location", hasSpot: true, hasPosition: true, onRoad: true }), { use: "location" });
  assert.deepEqual(alertPlan({ mode: "spot", hasSpot: false, hasPosition: true, onRoad: true }), { use: "location" }); // no spot yet
});

test("alertPlan: far from the road, point to the spot if there is one, otherwise to setting one", () => {
  assert.deepEqual(alertPlan({ mode: "location", hasSpot: true, hasPosition: true, onRoad: false }), {
    use: null, problem: "far", fallback: "spot",
  });
  assert.deepEqual(alertPlan({ mode: "location", hasSpot: false, hasPosition: true, onRoad: false }), {
    use: null, problem: "far", fallback: "set-spot",
  });
});

test("alertPlan: no position (location off) is its own problem", () => {
  assert.deepEqual(alertPlan({ mode: "location", hasSpot: true, hasPosition: false, onRoad: false }), {
    use: null, problem: "no-position", fallback: "spot",
  });
  assert.deepEqual(alertPlan({ mode: "spot", hasSpot: false, hasPosition: false, onRoad: false }), {
    use: null, problem: "no-position", fallback: "set-spot",
  });
});
