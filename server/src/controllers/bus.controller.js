import { prisma } from "../config/db.js";

// A bus that has not reported for this long is shown as "signal lost" in the app.
// The ESP32 pings every 3-5 s, so 30 s means it missed several.
const STALE_AFTER_MS = 30_000;

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
      route: { select: { id: true, name: true } },
      state: true,
    },
  });

  const now = Date.now();

  const data = buses.map(({ state, ...bus }) => {
    // A bus that has never pinged has no state yet.
    if (!state) {
      return { ...bus, stale: true, state: null };
    }

    const onBoard = Math.max(0, state.doorInTotal - state.doorOutTotal);

    return {
      ...bus,
      stale: now - state.lastPingAt.getTime() > STALE_AFTER_MS,
      state: {
        lat: state.lat,
        lng: state.lng,
        speedKmh: Math.round(state.speedMps * 3.6 * 10) / 10,
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
