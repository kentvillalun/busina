import { OFF_ROUTE_AFTER_M, STALE_AFTER_MS } from "./eta.js";
import { snapToRoute } from "./geo.js";

// A real ESP32 cannot know its heading (the prototype firmware sends none, or a fixed "NORTHBOUND"), and the ETA and the alerts
// need one. So the server works it out from how far along the road the bus moved since its last ping.

const MIN_MOVE_M = 10; // a GPS fix wanders by a few meters even when the bus is parked
const MIN_SPEED_KMH = 5; // below this the bus is stopped, whatever the fixes say
const MAX_MOVE_M = 1000; // one ping cannot cover more (30 s at 120 km/h): a bigger jump is a GPS glitch or a reset position

// "SOUTHBOUND" (toward Vigan: progress along the route grows), "NORTHBOUND", or null when it cannot be told honestly:
// barely moving, off the road, or the last ping is too old. `from` and `to` are { lat, lng }; `gapMs` is the time between them.
// Both roads of the route are tried (the Bantay town road and the diversion) and the one the two fixes sit closest to is used.
const directionFromMove = ({ from, to, speedKmh, gapMs, route }) => {
  if (speedKmh < MIN_SPEED_KMH || gapMs > STALE_AFTER_MS) return null;

  let best = null;
  for (const road of [route.polyline, route.polylineNorthbound]) {
    if (!road) continue;
    const a = snapToRoute([from.lng, from.lat], road);
    const b = snapToRoute([to.lng, to.lat], road);
    if (!a || !b) continue;
    const error = Math.max(a.distanceFromRouteM, b.distanceFromRouteM);
    if (error > OFF_ROUTE_AFTER_M) continue;
    if (!best || error < best.error) best = { error, delta: b.progressM - a.progressM };
  }

  if (!best || Math.abs(best.delta) < MIN_MOVE_M || Math.abs(best.delta) > MAX_MOVE_M) return null;
  return best.delta > 0 ? "SOUTHBOUND" : "NORTHBOUND";
};

// What to store. The movement wins: a device's own guess can be a constant and wrong half of the trip. With no movement to go
// on, keep what the bus had, and only a bus that has no direction yet takes what the device sent.
const chooseDirection = ({ moved, stored, sent }) => moved ?? stored ?? sent ?? null;

export { chooseDirection, directionFromMove };
