import { prisma } from "../config/db.js";
import { notifyBusPing } from "../services/push.js";
import { HttpError } from "../utils/HttpError.js";
import { STALE_AFTER_MS } from "../utils/eta.js";

const ping = async (req, res) => {
  const { bus } = req;
  const { lat, lng, speedKmh, seats, doorIn, doorOut, direction } = req.body;

  if (seats.length !== bus.seatCount) {
    throw new HttpError(400, `seats must have exactly ${bus.seatCount} entries`, {
      code: "SEAT_COUNT_MISMATCH",
    });
  }

  const state = {
    lat,
    lng,
    speedMps: speedKmh / 3.6,
    seats,
    occupied: seats.reduce((total, seat) => total + seat, 0), // computed here, not trusted from the device
    doorInTotal: doorIn,
    doorOutTotal: doorOut,
    lastPingAt: new Date(), // server time: the device clock can be wrong
    ...(direction ? { direction } : {}), // keep the old direction when the device sends none
  };

  // Read before the upsert overwrites it: a long silence before this ping means the signal just came back.
  const before = await prisma.busState.findUnique({ where: { busId: bus.id }, select: { lastPingAt: true } });

  const saved = await prisma.busState.upsert({
    where: { busId: bus.id },
    update: state,
    create: { busId: bus.id, ...state },
  });

  // Push alerts run after the response is decided, not before it: the device must not wait on the push services.
  const signalReturned = !before || state.lastPingAt.getTime() - before.lastPingAt.getTime() > STALE_AFTER_MS;
  notifyBusPing({ bus, state: saved, signalReturned }).catch((error) => console.error("[push]", error));

  return res.json({ ok: true });
};

export { ping };
