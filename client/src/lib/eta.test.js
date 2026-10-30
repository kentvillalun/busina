// Run with: node --test src/lib/eta.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { etaFor, formatEta } from "./eta.js";

// A road running due north for about 1.1 km. Points are [lng, lat]. progressM grows toward the north here.
const route = { polyline: [[120, 18], [120, 18.01]] };
const bus = (progressM, direction, speedKmh = 25, extra = {}) => ({
  stale: false,
  state: { progressM, direction, speedKmh, offRoute: false },
  ...extra,
});
const user = { lat: 18.008, lng: 120.0001 }; // about 890 m along the road

test("a bus before the spot gets a range, the early end lower than the late end", () => {
  const eta = etaFor(bus(0, "SOUTHBOUND"), route, user);
  assert.equal(eta.passed, false);
  assert.ok(eta.minMin > 0 && eta.minMin < eta.maxMin);
  assert.ok(eta.maxMin < 4);
});

test("a bus beyond the spot, going away, has passed", () => {
  assert.equal(etaFor(bus(1100, "SOUTHBOUND"), route, user).passed, true);
});

test("the direction flips what ahead means", () => {
  assert.equal(etaFor(bus(1100, "NORTHBOUND"), route, user).passed, false);
  assert.equal(etaFor(bus(0, "NORTHBOUND"), route, user).passed, true);
});

test("a stopped bus does not divide by zero", () => {
  const eta = etaFor(bus(0, "SOUTHBOUND", 0), route, user);
  assert.ok(Number.isFinite(eta.maxMin));
});

test("no honest ETA gives null", () => {
  assert.equal(etaFor(bus(0, "SOUTHBOUND"), route, null), null); // location off
  assert.equal(etaFor(bus(0, "SOUTHBOUND", 25, { stale: true }), route, user), null); // signal lost
  assert.equal(etaFor(bus(0, "SOUTHBOUND"), route, { lat: 18.5, lng: 120 }), null); // user far from the road
});

test("the text", () => {
  assert.equal(formatEta({ passed: true }), "Passed");
  assert.equal(formatEta({ passed: false, minMin: 0.1, maxMin: 0.3 }), "Arriving");
  assert.equal(formatEta({ passed: false, minMin: 17.6, maxMin: 22.4 }), "18–22 min");
  assert.equal(formatEta({ passed: false, minMin: 5.1, maxMin: 5.4 }), "~5 min");
});
