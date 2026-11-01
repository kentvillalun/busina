// Run with: node --test src/lib/nearBus.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { alertBusesFor, minutesAway, targetOutcome } from "./nearBus.js";

const bus = (extra) => ({ id: "a", stale: false, state: { direction: "NORTHBOUND" }, eta: { passed: false, minMin: 4, maxMin: 6 }, ...extra });

test("minutesAway is the middle of the ETA range", () => {
  assert.equal(minutesAway(bus()), 5);
});

test("minutesAway is null when the bus has passed, has no ETA or lost its signal", () => {
  assert.equal(minutesAway(bus({ eta: { passed: true } })), null);
  assert.equal(minutesAway(bus({ eta: null })), null);
  assert.equal(minutesAway(bus({ stale: true })), null);
});

test("with no chosen bus, only buses going the saved direction can alert, whatever tab is open", () => {
  const north = bus();
  const south = bus({ id: "b", state: { direction: "SOUTHBOUND" } });
  assert.deepEqual(alertBusesFor([north, south], "NORTHBOUND"), [north]);
  assert.deepEqual(alertBusesFor([north, south], "SOUTHBOUND"), [south]);
});

test("a chosen bus is the only one that can alert, even in the other direction", () => {
  const north = bus();
  const south = bus({ id: "b", state: { direction: "SOUTHBOUND" } });
  assert.deepEqual(alertBusesFor([north, south], "NORTHBOUND", { id: "b" }), [south]);
});

test("targetOutcome: keep, passed, gone; a stale bus is kept", () => {
  assert.equal(targetOutcome([bus()], { id: "a" }), "ok");
  assert.equal(targetOutcome([bus({ stale: true })], { id: "a" }), "ok");
  assert.equal(targetOutcome([bus({ eta: { passed: true } })], { id: "a" }), "passed");
  assert.equal(targetOutcome([bus()], { id: "zzz" }), "gone");
});
