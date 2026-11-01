// What the ETA (and the alerts) are measured from: "location" (where the commuter stands now) or "spot" (the saved boarding
// spot). `stored` is the commuter's own choice (busina:target); with none, a saved spot wins and otherwise it is the location,
// which is what the app already did before there was a choice.
export const targetMode = (stored, spot) => {
  if (stored === "location" || stored === "spot") return stored;
  return spot ? "spot" : "location";
};
