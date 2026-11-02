// Run with: node --test src/utils/fleet.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { fleetBus, fleetStatus, isFresh } from "./fleet.js";

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

const road = { polyline: [[120.5, 17.9], [120.6, 17.9]], polylineNorthbound: null };
const row = (state, serviceStatus = "IN_SERVICE") => ({
  id: "b1", busNumber: "0015", name: "Demo", seatCount: 40, active: true, routeId: "r1", route: { name: "Laoag - Vigan" }, serviceStatus, state,
});
const state = (secondsAgo) => ({ lat: 17.9, lng: 120.55, speedMps: 10, occupied: 12, direction: "SOUTHBOUND", ...pinged(secondsAgo) });

test("a fresh bus shows seats free, speed and position", () => {
  const bus = fleetBus(row(state(5)), road, now);
  assert.equal(bus.status, "live");
  assert.equal(bus.seatsFree, 28);
  assert.equal(bus.speedKmh, 36);
  assert.equal(bus.direction, "SOUTHBOUND");
  assert.ok(bus.position.lat > 17.8 && bus.position.lat < 18);
});

test("a silent bus hides seats and speed but keeps its last position", () => {
  const bus = fleetBus(row(state(120)), road, now);
  assert.equal(bus.status, "stale");
  assert.equal(bus.seatsFree, null);
  assert.equal(bus.speedKmh, null);
  assert.ok(bus.position);
});

test("a bus that never pinged has nothing but its name and a status", () => {
  const bus = fleetBus(row(null), undefined, now);
  assert.equal(bus.status, "no_signal");
  assert.deepEqual([bus.position, bus.seatsFree, bus.speedKmh, bus.lastPingAt, bus.direction], [null, null, null, null, null]);
});

test("the row has exactly the listed fields: no secrets, no raw state", () => {
  const keys = Object.keys(fleetBus({ ...row(state(5)), deviceId: "esp-1", deviceKeyHash: "x", pinHash: "y" }, road, now)).sort();
  assert.deepEqual(keys, ["active", "busNumber", "crew", "direction", "id", "lastPingAt", "name", "plateNumber", "position", "routeName", "seatCount", "seatsFree", "speedKmh", "status"]);
});

test("a disabled bus shows as disabled, whatever its signal says", () => {
  assert.equal(fleetStatus({ active: false, serviceStatus: "IN_SERVICE", state: pinged(5) }, now), "disabled");
  assert.equal(fleetBus({ ...row(state(5)), active: false }, road, now).status, "disabled");
});

test("the crew is the active staff of the bus, by full name and role", () => {
  const staff = [{ firstName: "Juan", lastName: "Dela Cruz", role: "DRIVER", busId: "b1" }, { firstName: "Ana", lastName: "Reyes", role: "CONDUCTOR" }];
  assert.deepEqual(fleetBus({ ...row(state(5)), staff }, road, now).crew, [{ name: "Juan Dela Cruz", role: "DRIVER" }, { name: "Ana Reyes", role: "CONDUCTOR" }]);
  assert.deepEqual(fleetBus(row(state(5)), road, now).crew, []);
});

test("seats free never go below zero when a sensor counts too many", () => {
  assert.equal(fleetBus(row({ ...state(5), occupied: 43 }), road, now).seatsFree, 0);
});
