import { STALE_AFTER_MS } from "./eta.js";

// A bus that pinged in the last 30 seconds still has live seats and speed; an older ping is only a last known position.
const isFresh = (state, now = Date.now()) => Boolean(state) && now - state.lastPingAt.getTime() <= STALE_AFTER_MS;

// What the operator sees for one bus. A driver who put the bus at rest wins over a missing signal: that bus is off duty.
const fleetStatus = ({ serviceStatus, state }, now = Date.now()) => {
  if (serviceStatus === "AT_REST") return "at_rest";
  if (!state) return "no_signal";
  if (!isFresh(state, now)) return "stale";
  return serviceStatus === "STOPOVER" ? "stopover" : "live";
};

export { fleetStatus, isFresh };
