import { prisma } from "../config/db.js";
import { busOnRoad, STALE_AFTER_MS } from "../utils/eta.js";

// GET /buses: public (commuters are anonymous). The current state of every active bus.
// Never returns deviceId or deviceKeyHash: those are secrets of the hardware.
const listBuses = async (req, res) => {
  const buses = await prisma.bus.findMany({
    where: { active: true },
    orderBy: { busNumber: "asc" },
    select: {
      id: true,
      busNumber: true,
      plateNumber: true,
      name: true,
      photoUrl: true,
      seatCount: true,
      company: { select: { name: true, shortName: true, logoUrl: true } },
      route: { select: { id: true, name: true, polyline: true, polylineNorthbound: true } },
      state: true,
    },
  });

  const now = Date.now();

  const data = buses.map(({ state, route: { polyline, polylineNorthbound, ...route }, ...bus }) => {
    // A bus that has never pinged has no state yet.
    if (!state) {
      return { ...bus, route, stale: true, state: null };
    }

    // Draw the bus on its road, and tell the ETA how far along the road it is (the push sender reads it the same way).
    const { snapped, offRoute, progressM, speedKmh } = busOnRoad(state, { polyline, polylineNorthbound });

    const onBoard = Math.max(0, state.doorInTotal - state.doorOutTotal);

    return {
      ...bus,
      route,
      stale: now - state.lastPingAt.getTime() > STALE_AFTER_MS,
      state: {
        lat: offRoute ? state.lat : snapped.lat,
        lng: offRoute ? state.lng : snapped.lng,
        offRoute,
        progressM,
        speedKmh,
        direction: state.direction,
        seats: state.seats,
        occupied: state.occupied,
        seatsFree: bus.seatCount - state.occupied,
        // People counted by the door sensors. Can be higher than the seats taken: the rest are standing.
        onBoard,
        standing: Math.max(0, onBoard - state.occupied),
        lastPingAt: state.lastPingAt,
      },
    };
  });

  return res.json({ serverTime: new Date().toISOString(), buses: data });
};

export { listBuses };
