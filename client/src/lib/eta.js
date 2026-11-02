import { snapToRoute } from "./geo.js";

// Tuned after real test runs (PROJECT_SPEC section 6). The ETA is a range, never one exact number.
const MIN_SPEED_KMH = 10; // a stopped bus is assumed to leave soon at this speed (and we never divide by zero)
const FAST = 1.2; // the bus goes 20% faster than it is now: the early end of the range
const SLOW = 0.8; // 20% slower: the late end
const PASSED_AFTER_M = 30; // this far beyond the spot counts as passed; closer reads as arriving
const MAX_SPOT_FROM_ROUTE_M = 1000; // farther than this the user is not on this bus's route
const ON_ROAD_M = 100; // within this of a road counts as standing on it: no boarding spot needed, the position will do

// Is the commuter on (or right next to) the route? Either carriageway counts: they only have to be where buses pass.
const isOnRoad = (userPos, route) => {
  if (!userPos || !route) return false;
  return [route.polyline, route.polylineNorthbound]
    .filter(Boolean)
    .some((road) => (snapToRoute(userPos, road)?.distanceFromRouteM ?? Infinity) <= ON_ROAD_M);
};

// The road a bus follows: northbound buses take the diversion when the route has one.
const roadFor = (route, direction) =>
  direction === "NORTHBOUND" && route.polylineNorthbound ? route.polylineNorthbound : route.polyline;

// ETA of a bus to the user's position, as { passed: true, spotM } or { passed: false, minMin, maxMin, spotM },
// where spotM is the user's distance along the route,
// or null when there is nothing honest to say (no location, signal lost, off the route, user far from the route).
const etaFor = (bus, route, userPos) => {
  const { state } = bus;
  if (!userPos || !route || !state || bus.stale || bus.stopped || state.offRoute) return null;
  if (state.progressM == null || !state.direction) return null;

  const spot = snapToRoute(userPos, roadFor(route, state.direction));
  if (!spot || spot.distanceFromRouteM > MAX_SPOT_FROM_ROUTE_M) return null;

  // progressM grows toward Vigan, so a southbound bus still has to cover (spot - bus) and a northbound one the opposite.
  const remainingM = (state.direction === "SOUTHBOUND" ? 1 : -1) * (spot.progressM - state.progressM);
  if (remainingM < -PASSED_AFTER_M) return { passed: true, spotM: spot.progressM };

  const speedMps = Math.max(state.speedKmh, MIN_SPEED_KMH) / 3.6;
  const minutesAt = (factor) => Math.max(0, remainingM) / (speedMps * factor) / 60;
  return { passed: false, minMin: minutesAt(FAST), maxMin: minutesAt(SLOW), spotM: spot.progressM };
};

// "18-22 min", "~5 min", "Arriving" or "Passed".
const formatEta = (eta) => {
  if (eta.passed) return "Passed";
  const low = Math.round(eta.minMin);
  const high = Math.round(eta.maxMin);
  if (high < 1) return "Arriving";
  return low === high ? `~${high} min` : `${low}–${high} min`;
};

// "40 km/h", or "Stopped" when it is barely moving. Rounded to 5 so the number does not jump with every GPS reading.
// null when there is no speed to show.
const formatSpeed = (speedKmh) => {
  if (!Number.isFinite(speedKmh)) return null;
  const rounded = Math.round(speedKmh / 5) * 5;
  return rounded === 0 ? "Stopped" : `${rounded} km/h`;
};

// For sorting: the sooner the bus, the smaller; a bus that has passed goes last.
const etaOrder = (eta) => (eta.passed ? 1e9 : eta.minMin);

export { etaFor, etaOrder, formatEta, formatSpeed, isOnRoad, MAX_SPOT_FROM_ROUTE_M, roadFor };
