// Run with: node --test src/utils/pickups.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { groupPickups } from "./pickups.js";

const spot = (progressM) => ({ progressM, lat: 18, lng: 120 });

test("a southbound bus sees the spots with a larger progress, nearest first", () => {
  const groups = groupPickups({ busProgressM: 1000, direction: "SOUTHBOUND", spots: [spot(5000), spot(2200)] });
  assert.deepEqual(groups.map((g) => g.distanceM), [1200, 4000]);
});

test("a northbound bus sees the spots with a smaller progress", () => {
  const groups = groupPickups({ busProgressM: 5000, direction: "NORTHBOUND", spots: [spot(1000), spot(4000), spot(9000)] });
  assert.deepEqual(groups.map((g) => g.distanceM), [1000, 4000]);
});

test("spots behind the bus and spots too far ahead are left out; just passed still counts", () => {
  const spots = [spot(500), spot(990), spot(150_000)];
  assert.deepEqual(groupPickups({ busProgressM: 1000, direction: "SOUTHBOUND", spots }).map((g) => g.distanceM), [0]);
});

test("spots within 150 m of each other are one stop with a count", () => {
  const groups = groupPickups({ busProgressM: 0, direction: "SOUTHBOUND", spots: [spot(1000), spot(1100), spot(1200), spot(3000)] });
  assert.deepEqual(groups.map((g) => [g.count, g.distanceM]), [[3, 1000], [1, 3000]]);
});

test("no spots, no groups, and the result carries no extra fields", () => {
  assert.deepEqual(groupPickups({ busProgressM: 0, direction: "SOUTHBOUND", spots: [] }), []);
  assert.deepEqual(Object.keys(groupPickups({ busProgressM: 0, direction: "SOUTHBOUND", spots: [spot(100)] })[0]).sort(), ["count", "distanceM", "lat", "lng"]);
});
