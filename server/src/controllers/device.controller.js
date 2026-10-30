import { prisma } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";

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

  await prisma.busState.upsert({
    where: { busId: bus.id },
    update: state,
    create: { busId: bus.id, ...state },
  });

  return res.json({ ok: true });
};

export { ping };
