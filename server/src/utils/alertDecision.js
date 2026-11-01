// Port of the near-bus rules in client/src/lib/nearBus.js and useNearBusAlert.js, for one subscription and one bus.
// Pure on purpose: no database, no clock, so every rule can be tested.
//
// `notified` is the subscription's notifiedBusIds: "<busId>" = the near alert was sent, "passed:<busId>" = the passed alert was sent.
// `eta` is etaFor's result (null, passed or a range). `isTarget` is true when the commuter chose this bus.
// `signalReturned` is true when this ping follows a silence longer than the stale limit (or is the bus's first).
// Returns { send: "near" | "passed" | null, minutes, notified, clearTarget }.

const decideAlert = ({ notified, busId, eta, alertMinutes, isTarget, signalReturned }) => {
  const near = busId;
  const passed = `passed:${busId}`;
  const list = new Set(notified);

  // Same as the client: a bus that came back from a signal loss, or went out of range, may alert again.
  if (signalReturned) list.delete(near);

  const minutes = eta && !eta.passed ? (eta.minMin + eta.maxMin) / 2 : null;
  let send = null;
  let clearTarget = false;

  if (minutes === null || minutes > alertMinutes) {
    list.delete(near); // not near any more (or no honest ETA): it may alert again next time
  } else if (!list.has(near)) {
    list.add(near);
    send = "near";
  }

  if (eta?.passed) {
    // The chosen bus went by the spot: say so once, and the choice ends (the app clears it the same way).
    if (isTarget && !list.has(passed)) {
      list.add(passed);
      send = "passed";
      clearTarget = true;
    }
  } else {
    list.delete(passed); // it is before the spot again (next trip): the passed alert may be sent again
  }

  return { send, minutes, notified: [...list], clearTarget };
};

export { decideAlert };
