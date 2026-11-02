// "Who is waiting ahead of this bus": the saved boarding spots of commuters who set an alert, grouped so the driver sees
// where to expect passengers, never who they are. Pure; the controller does the database and the snapping.

const MAX_AHEAD_M = 15_000; // farther than this is not worth the driver's attention yet
const BEHIND_TOLERANCE_M = 30; // just past a spot still counts, like etaFor
const GROUP_GAP_M = 150; // spots this close along the road are one stop

// `spots` are { progressM, lat, lng } already snapped to the bus's road. Returns [{ count, distanceM, lat, lng }],
// nearest first; lat/lng is the first spot of the group.
const groupPickups = ({ busProgressM, direction, spots }) => {
  const sign = direction === "SOUTHBOUND" ? 1 : -1; // progressM grows toward Vigan
  const ahead = spots
    .map((spot) => ({ ...spot, distanceM: sign * (spot.progressM - busProgressM) }))
    .filter((spot) => spot.distanceM >= -BEHIND_TOLERANCE_M && spot.distanceM <= MAX_AHEAD_M)
    .sort((a, b) => a.distanceM - b.distanceM);

  const groups = [];
  for (const spot of ahead) {
    const last = groups.at(-1);
    if (last && spot.distanceM - last.lastM <= GROUP_GAP_M) {
      last.count += 1;
      last.lastM = spot.distanceM;
    } else {
      groups.push({ count: 1, distanceM: Math.max(0, Math.round(spot.distanceM)), lat: spot.lat, lng: spot.lng, lastM: spot.distanceM });
    }
  }
  return groups.map(({ lastM, ...group }) => group);
};

export { groupPickups, MAX_AHEAD_M };
