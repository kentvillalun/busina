import { busOnRoad, STALE_AFTER_MS } from "./eta.js";

// A bus that pinged in the last 30 seconds still has live seats and speed; an older ping is only a last known position.
const isFresh = (state, now = Date.now()) => Boolean(state) && now - state.lastPingAt.getTime() <= STALE_AFTER_MS;

// What the operator sees for one bus. A bus the operator disabled comes first; a driver who put the bus at rest wins over a
// missing signal: that bus is off duty.
const fleetStatus = ({ active = true, serviceStatus, state }, now = Date.now()) => {
  if (!active) return "disabled";
  if (serviceStatus === "AT_REST") return "at_rest";
  if (!state) return "no_signal";
  if (!isFresh(state, now)) return "stale";
  return serviceStatus === "STOPOVER" ? "stopover" : "live";
};

// One bus of GET /operator/fleet. `bus` is a Bus row with its `route` ({ name }) and `state`; `road` is the route's polylines.
// Seats and speed are given only for a fresh ping, so a silent bus never shows numbers that went stale; it keeps its last
// position so the map can show where it went quiet. The fields are listed one by one, so a secret (deviceKeyHash, pinHash)
// can never leak into the answer by someone widening the query.
const fleetBus = ({ id, busNumber, name, seatCount, active, serviceStatus, route, state }, road, now = Date.now()) => {
  const result = {
    id,
    busNumber,
    name,
    seatCount,
    active,
    routeName: route.name,
    status: fleetStatus({ active, serviceStatus, state }, now),
    direction: null,
    position: null,
    speedKmh: null,
    seatsFree: null,
    lastPingAt: null,
  };
  if (!state) return result;

  const { snapped, offRoute, speedKmh } = busOnRoad(state, road);
  result.direction = state.direction;
  result.position = { lat: offRoute ? state.lat : snapped.lat, lng: offRoute ? state.lng : snapped.lng };
  result.lastPingAt = state.lastPingAt;
  if (isFresh(state, now)) {
    result.speedKmh = speedKmh;
    result.seatsFree = seatCount - state.occupied;
  }
  return result;
};

export { fleetBus, fleetStatus, isFresh };
