// Run with: node --test src/lib/geo.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { distanceM, routeBetween } from "./geo.js";

// A bent road: about 1.1 km north, then about 1.1 km east. Points are [lng, lat].
const road = [[120, 18], [120, 18.01], [120.01, 18.01]];
const length = (points) =>
  points.slice(1).reduce((sum, p, i) => sum + distanceM({ lat: points[i][0], lng: points[i][1] }, { lat: p[0], lng: p[1] }), 0);

test("a stretch inside one segment", () => {
  const stretch = routeBetween(road, 200, 600);
  assert.equal(stretch.length, 2);
  assert.ok(Math.abs(length(stretch) - 400) < 2);
});

test("a stretch around the bend keeps the corner", () => {
  const stretch = routeBetween(road, 800, 1500);
  assert.equal(stretch.length, 3);
  assert.deepEqual(stretch[1], [18.01, 120]);
  assert.ok(Math.abs(length(stretch) - 700) < 3);
});

test("the order of the two distances does not matter", () => {
  assert.deepEqual(routeBetween(road, 600, 200), routeBetween(road, 200, 600));
});
