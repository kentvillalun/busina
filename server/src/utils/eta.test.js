// Run with: node --test src/utils/eta.test.js
// The server's etaFor must give the client's answer for the same bus, road and spot: the push alert and the number the
// commuter sees in the app are the same promise. The client file is imported on purpose (it has no dependencies).
import assert from "node:assert/strict";
import { test } from "node:test";
import { etaFor as clientEtaFor } from "../../../client/src/lib/eta.js";
import { busOnRoad, etaFor, roadFor } from "./eta.js";

// A bendy road of about 3 km, [lng, lat], and a detour for northbound buses.
const route = {
  polyline: [[120, 18], [120.004, 18.006], [120.006, 18.012], [120.012, 18.016], [120.02, 18.02]],
  polylineNorthbound: [[120, 18], [120.006, 18.004], [120.01, 18.012], [120.02, 18.02]],
};
const bus = (progressM, direction, speedKmh, extra = {}) => ({
  stale: false,
  state: { progressM, direction, speedKmh, offRoute: false },
  ...extra,
});

test("same answer as the client for many buses, directions, speeds and spots", () => {
  const spots = [
    { lat: 18.012, lng: 120.006 }, // on the road
    { lat: 18.0122, lng: 120.0072 }, // a little off it
    { lat: 18.018, lng: 120.014 },
    { lat: 18.0005, lng: 120.0001 }, // near the start
    { lat: 18.5, lng: 120.5 }, // far from the road: null
  ];
  let compared = 0;
  for (const direction of ["SOUTHBOUND", "NORTHBOUND"]) {
    for (const progressM of [0, 400, 1200, 2500, 3300, 4000]) {
      for (const speedKmh of [0, 8, 25, 60]) {
        for (const userPos of spots) {
          for (const extra of [{}, { stale: true }]) {
            const input = bus(progressM, direction, speedKmh, extra);
            assert.deepEqual(etaFor(input, route, userPos), clientEtaFor(input, route, userPos));
            compared += 1;
          }
        }
      }
    }
  }
  assert.equal(compared, 2 * 6 * 4 * 5 * 2);
});

test("no honest ETA gives null", () => {
  const user = { lat: 18.012, lng: 120.006 };
  assert.equal(etaFor(bus(0, "SOUTHBOUND", 25), route, null), null);
  assert.equal(etaFor(bus(0, "SOUTHBOUND", 25, { stale: true }), route, user), null);
  assert.equal(etaFor({ stale: false, state: { progressM: 10, direction: null, speedKmh: 25, offRoute: false } }, route, user), null);
  assert.equal(etaFor({ stale: false, state: { progressM: 10, direction: "SOUTHBOUND", speedKmh: 25, offRoute: true } }, route, user), null);
});

test("busOnRoad reads a BusState the way GET /buses does", () => {
  const onRoad = busOnRoad({ lat: 18.006, lng: 120.004, direction: "SOUTHBOUND", speedMps: 25 / 3.6 }, route);
  assert.equal(onRoad.offRoute, false);
  assert.ok(onRoad.progressM > 600 && onRoad.progressM < 1000);
  assert.equal(onRoad.speedKmh, 25);

  const far = busOnRoad({ lat: 18.2, lng: 120.2, direction: "SOUTHBOUND", speedMps: 5 }, route);
  assert.equal(far.offRoute, true); // 100 m or more from the road: not drawn on it, and no ETA
});

test("a northbound bus uses the northbound road", () => {
  assert.equal(roadFor(route, "NORTHBOUND"), route.polylineNorthbound);
  assert.equal(roadFor(route, "SOUTHBOUND"), route.polyline);
  assert.equal(roadFor({ polyline: route.polyline }, "NORTHBOUND"), route.polyline);
});
