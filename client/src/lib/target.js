// What the ETA (and the alerts) are measured from: "location" (where the commuter stands now) or "spot" (the saved boarding
// spot). `stored` is the commuter's own choice (busina:target); with none, a saved spot wins and otherwise it is the location,
// which is what the app already did before there was a choice.
export const targetMode = (stored, spot) => {
  if (stored === "location" || stored === "spot") return stored;
  return spot ? "spot" : "location";
};

// What "Alert me" should do. The alert is timed to where the commuter stands when they chose that on Home (or have no spot),
// and that only works when we have their position and they are on the road. Otherwise `fallback` says what to point them to:
// their boarding spot when they have one, or setting one.
// Returns { use: "spot" | "location" } or { use: null, problem: "far" | "no-position", fallback: "spot" | "set-spot" }.
export const alertPlan = ({ mode, hasSpot, hasPosition, onRoad }) => {
  const viaLocation = mode === "location" || !hasSpot;
  if (!viaLocation) return { use: "spot" };
  if (hasPosition && onRoad) return { use: "location" };
  return { use: null, problem: hasPosition ? "far" : "no-position", fallback: hasSpot ? "spot" : "set-spot" };
};
