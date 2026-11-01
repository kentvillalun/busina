import { prisma } from "../config/db.js";

// The browser re-sends this whenever the spot, minutes, direction or chosen bus changes, so it is an upsert on `endpoint`.
const subscribe = async (req, res) => {
  const { endpoint, keys, spot, alertMinutes, direction, targetBusId = null } = req.body;

  const data = {
    p256dh: keys.p256dh,
    auth: keys.auth,
    spotLat: spot.lat,
    spotLng: spot.lng,
    alertMinutes,
    direction,
    targetBusId,
  };

  // A new spot, direction or chosen bus is a new approach: buses already alerted for the old setup may alert again.
  const old = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  const moved =
    old &&
    (old.spotLat !== data.spotLat ||
      old.spotLng !== data.spotLng ||
      old.direction !== direction ||
      old.targetBusId !== targetBusId);

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: moved ? { ...data, notifiedBusIds: [] } : data,
    create: { endpoint, ...data },
  });

  return res.status(201).json({ ok: true });
};

// Idempotent: removing a subscription that is already gone is not an error.
const unsubscribe = async (req, res) => {
  await prisma.pushSubscription.deleteMany({ where: { endpoint: req.body.endpoint } });
  return res.json({ ok: true });
};

export { subscribe, unsubscribe };
