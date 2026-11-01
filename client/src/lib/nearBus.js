// Minutes until a bus reaches the boarding spot (middle of the ETA range), or null when it cannot alert:
// no ETA, already passed, or signal lost (its position is old).
export const minutesAway = (bus) => {
  const { eta } = bus;
  if (bus.stale || !eta || eta.passed) return null;
  return (eta.minMin + eta.maxMin) / 2;
};

// Buses that may alert. A bus the commuter chose on its detail page ({ id }) is the only one. With no choice, any bus going
// the direction saved in Settings. The home tab is for browsing, so it must not decide this.
export const alertBusesFor = (buses, direction, target = null) =>
  target ? buses.filter((bus) => bus.id === target.id) : buses.filter((bus) => bus.state.direction === direction);

// What happened to the chosen bus: "ok" (keep it), "passed" (went by the spot) or "gone" (not in the list: resting or off the road).
// A short signal loss is still "ok": the bus can come back.
export const targetOutcome = (buses, target) => {
  const bus = buses.find((item) => item.id === target.id);
  if (!bus) return "gone";
  return bus.eta?.passed ? "passed" : "ok";
};

// Drops from `notified` (a Set of bus ids) every bus that is no longer in `buses`, so it can alert again if it comes back.
export const forgetGone = (notified, buses) => {
  for (const id of notified) {
    if (!buses.some((bus) => bus.id === id)) notified.delete(id);
  }
};
