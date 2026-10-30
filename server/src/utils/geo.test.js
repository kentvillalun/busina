// Run with: node --test src/utils/geo.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathLengthM, snapToRoute } from "./geo.js";

// A road running due north for about 1.1 km. Points are [lng, lat].
const road = [
  [120, 18],
  [120, 18.01],
];

test("a point beside the road snaps onto it", () => {
  const snapped = snapToRoute([120.0005, 18.005], road);
  assert.ok(Math.abs(snapped.lat - 18.005) < 0.0001);
  assert.equal(snapped.lng, 120);
  assert.ok(Math.abs(snapped.progressM - pathLengthM(road) / 2) < 3);
  assert.ok(Math.abs(snapped.distanceFromRouteM - 52.9) < 1);
});

test("a point past either end snaps to that end", () => {
  assert.ok(Math.abs(snapToRoute([120, 18.02], road).progressM - pathLengthM(road)) < 1);
  assert.equal(snapToRoute([120, 17.99], road).progressM, 0);
});

test("progress adds up over a bent road", () => {
  const bent = [[120, 18], [120, 18.01], [120.01, 18.01]];
  const snapped = snapToRoute([120.005, 18.0101], bent);
  assert.ok(Math.abs(snapped.progressM - (pathLengthM(bent.slice(0, 2)) + pathLengthM(bent.slice(1)) / 2)) < 5);
});

test("a route with fewer than two points gives null", () => {
  assert.equal(snapToRoute([120, 18], [[120, 18]]), null);
});
