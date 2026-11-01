import { snapToRoute } from "./geo.js";

// Port of client/src/lib/eta.js: the server needs the same ETA to decide when to send a push, and the two packages cannot
// share a file. eta.test.js runs both on the same input so they cannot drift apart. Points here are [lng, lat].

// Tuned after real test runs (PROJECT_SPEC section 6). The ETA is a range, never one exact number.
const MIN_SPEED_KMH = 10; // a stopped bus is assumed to leave soon at this speed (and we never divide by zero)
const FAST = 1.2; // the bus goes 20% faster than it is now: the early end of the range
const SLOW = 0.8; // 20% slower: the late end
const PASSED_AFTER_M = 30; // this far beyond the spot counts as passed; closer reads as arriving
const MAX_SPOT_FROM_ROUTE_M = 1000; // farther than this the user is not on this bus's route

// Farther than this from its route, a GPS fix is not drawn on the road: the app would show a bus where it is not.
const OFF_ROUTE_AFTER_M = 100;
// A bus that has not reported for this long is shown as "signal lost" in the app.
// The ESP32 pings every 3-5 s, so 30 s means it missed several.
const STALE_AFTER_MS = 30_000;

// The road a bus follows: northbound buses take the diversion when the route has one.
const roadFor = (route, direction) =>
  direction === "NORTHBOUND" && route.polylineNorthbound ? route.polylineNorthbound : route.polyline;

// Where a BusState sits on its road, in the shape GET /buses gives the app (and etaFor reads):
// { snapped, offRoute, progressM, speedKmh }. `snapped` is null only when the road has fewer than two points.
const busOnRoad = (state, route) => {
  const snapped = snapToRoute([state.lng, state.lat], roadFor(route, state.direction));
  return {
    snapped,
    offRoute: !snapped || snapped.distanceFromRouteM > OFF_ROUTE_AFTER_M,
    progressM: snapped ? Math.round(snapped.progressM) : null,
    speedKmh: Math.round(state.speedMps * 3.6 * 10) / 10,
  };
};

// ETA of a bus to the user's position, as { passed: true, spotM } or { passed: false, minMin, maxMin, spotM },
// or null when there is nothing honest to say (no location, signal lost, off the route, user far from the route).
// `bus` is { stale, state: { progressM, direction, speedKmh, offRoute } } and `userPos` is { lat, lng }.
const etaFor = (bus, route, userPos) => {
  const { state } = bus;
  if (!userPos || !route || !state || bus.stale || state.offRoute) return null;
  if (state.progressM == null || !state.direction) return null;

  const spot = snapToRoute([userPos.lng, userPos.lat], roadFor(route, state.direction));
  if (!spot || spot.distanceFromRouteM > MAX_SPOT_FROM_ROUTE_M) return null;

  // progressM grows toward Vigan, so a southbound bus still has to cover (spot - bus) and a northbound one the opposite.
  const remainingM = (state.direction === "SOUTHBOUND" ? 1 : -1) * (spot.progressM - state.progressM);
  if (remainingM < -PASSED_AFTER_M) return { passed: true, spotM: spot.progressM };

  const speedMps = Math.max(state.speedKmh, MIN_SPEED_KMH) / 3.6;
  const minutesAt = (factor) => Math.max(0, remainingM) / (speedMps * factor) / 60;
  return { passed: false, minMin: minutesAt(FAST), maxMin: minutesAt(SLOW), spotM: spot.progressM };
};

export { busOnRoad, etaFor, OFF_ROUTE_AFTER_M, roadFor, STALE_AFTER_MS };
