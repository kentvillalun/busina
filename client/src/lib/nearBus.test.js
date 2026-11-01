// Run with: node --test src/lib/nearBus.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { alertBusesFor, minutesAway } from "./nearBus.js";

const bus = (extra) => ({ stale: false, state: { direction: "NORTHBOUND" }, eta: { passed: false, minMin: 4, maxMin: 6 }, ...extra });

test("minutesAway is the middle of the ETA range", () => {
  assert.equal(minutesAway(bus()), 5);
});

test("minutesAway is null when the bus has passed, has no ETA or lost its signal", () => {
  assert.equal(minutesAway(bus({ eta: { passed: true } })), null);
  assert.equal(minutesAway(bus({ eta: null })), null);
  assert.equal(minutesAway(bus({ stale: true })), null);
});

test("only buses going the saved direction can alert, whatever tab is open", () => {
  const north = bus();
  const south = bus({ state: { direction: "SOUTHBOUND" } });
  assert.deepEqual(alertBusesFor([north, south], "NORTHBOUND"), [north]);
  assert.deepEqual(alertBusesFor([north, south], "SOUTHBOUND"), [south]);
});
