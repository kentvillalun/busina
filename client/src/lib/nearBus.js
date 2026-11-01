// Minutes until a bus reaches the boarding spot (middle of the ETA range), or null when it cannot alert:
// no ETA, already passed, or signal lost (its position is old).
export const minutesAway = (bus) => {
  const { eta } = bus;
  if (bus.stale || !eta || eta.passed) return null;
  return (eta.minMin + eta.maxMin) / 2;
};

// Buses that may alert: only the direction the commuter saved in Settings. The home tab is for browsing, so it must not decide this.
export const alertBusesFor = (buses, direction) => buses.filter((bus) => bus.state.direction === direction);
