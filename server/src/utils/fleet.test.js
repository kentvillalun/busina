// Run with: node --test src/utils/fleet.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { fleetStatus, isFresh } from "./fleet.js";

const now = Date.parse("2026-11-03T10:00:00Z");
const pinged = (secondsAgo) => ({ lastPingAt: new Date(now - secondsAgo * 1000) });

test("a bus that pinged a moment ago is live", () => {
  assert.equal(fleetStatus({ serviceStatus: "IN_SERVICE", state: pinged(5) }, now), "live");
});

test("a bus silent for more than 30 seconds lost its signal", () => {
  assert.equal(fleetStatus({ serviceStatus: "IN_SERVICE", state: pinged(31) }, now), "stale");
  assert.equal(isFresh(pinged(30), now), true);
  assert.equal(isFresh(pinged(31), now), false);
});

test("a bus that never pinged has no signal yet", () => {
  assert.equal(fleetStatus({ serviceStatus: "IN_SERVICE", state: null }, now), "no_signal");
});

test("the driver's choice: stopover while pinging, and at rest wins over a missing signal", () => {
  assert.equal(fleetStatus({ serviceStatus: "STOPOVER", state: pinged(5) }, now), "stopover");
  assert.equal(fleetStatus({ serviceStatus: "AT_REST", state: pinged(900) }, now), "at_rest");
  assert.equal(fleetStatus({ serviceStatus: "AT_REST", state: null }, now), "at_rest");
});

test("a stopover bus that went silent shows the lost signal", () => {
  assert.equal(fleetStatus({ serviceStatus: "STOPOVER", state: pinged(60) }, now), "stale");
});
