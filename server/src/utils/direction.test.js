// Run with: node --test src/utils/direction.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseDirection, directionFromMove } from "./direction.js";

// The Bantay town road runs due north (lat grows) for about 2.2 km; "forward" along it is toward Vigan = SOUTHBOUND.
// The diversion bends away from it (about 160 m east in the middle). Points are [lng, lat].
const route = {
  polyline: [[120, 18], [120, 18.01], [120, 18.02]],
  polylineNorthbound: [[120, 18], [120.005, 18.01], [120, 18.02]],
};
const move = (extra) => ({ from: { lat: 18.005, lng: 120 }, to: { lat: 18.006, lng: 120 }, speedKmh: 30, gapMs: 3000, route, ...extra });

test("moving forward along the road is SOUTHBOUND, backward is NORTHBOUND", () => {
  assert.equal(directionFromMove(move()), "SOUTHBOUND"); // about 110 m forward
  assert.equal(directionFromMove(move({ from: { lat: 18.006, lng: 120 }, to: { lat: 18.005, lng: 120 } })), "NORTHBOUND");
});

test("a parked or slow bus says nothing: a GPS fix wanders by itself", () => {
  assert.equal(directionFromMove(move({ speedKmh: 4 })), null);
  assert.equal(directionFromMove(move({ to: { lat: 18.00505, lng: 120 } })), null); // about 5 m
});

test("a glitch, an old ping or a fix off the road is not trusted", () => {
  assert.equal(directionFromMove(move({ to: { lat: 18.018, lng: 120 } })), null); // a 1.4 km jump in one ping
  assert.equal(directionFromMove(move({ gapMs: 31000 })), null); // the signal was lost in between
  assert.equal(directionFromMove(move({ from: { lat: 18.005, lng: 120.005 }, to: { lat: 18.006, lng: 120.005 } })), null); // 500 m from the road
});

test("on the diversion the movement is read along the diversion", () => {
  // These points are 160 m from the town road but on the diversion.
  const a = { lat: 18.003, lng: 120.0015 };
  const b = { lat: 18.004, lng: 120.002 };
  assert.equal(directionFromMove(move({ from: a, to: b })), "SOUTHBOUND");
  assert.equal(directionFromMove(move({ from: b, to: a })), "NORTHBOUND");
  assert.equal(directionFromMove(move({ from: a, to: b, route: { polyline: route.polyline } })), null); // no diversion known: off the road
});

test("chooseDirection: the movement wins, then what the bus had, then what the device sent", () => {
  assert.equal(chooseDirection({ moved: "SOUTHBOUND", stored: "NORTHBOUND", sent: "NORTHBOUND" }), "SOUTHBOUND");
  assert.equal(chooseDirection({ moved: null, stored: "SOUTHBOUND", sent: "NORTHBOUND" }), "SOUTHBOUND"); // a fixed guess does not undo it at a stop
  assert.equal(chooseDirection({ moved: null, stored: null, sent: "NORTHBOUND" }), "NORTHBOUND");
  assert.equal(chooseDirection({ moved: null, stored: null, sent: undefined }), null);
});
