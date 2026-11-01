import { prisma } from "../config/db.js";
import { distanceM } from "../utils/geo.js";

// A commuter timing the alert to where they stand sends a slightly different position every time (GPS jitter): only a real move
// counts as a new spot, or the "already alerted" list would be emptied and the same bus would alert again.
const SPOT_MOVED_M = 50;

// The browser re-sends this whenever the spot, minutes, direction or chosen bus changes, so it is an upsert on `endpoint`.
// The endpoint is a secret URL only that browser knows, so whoever presents it owns it: on a shared phone the commuter who
// signed in last takes the row over (commuterId is part of `data`, so an update moves it too).
const subscribe = async (req, res) => {
  const { endpoint, keys, spot, alertMinutes, direction, targetBusId = null } = req.body;

  const data = {
    commuterId: req.user.id,
    p256dh: keys.p256dh,
    auth: keys.auth,
    spotLat: spot.lat,
    spotLng: spot.lng,
    alertMinutes,
    direction,
    targetBusId,
  };

  // A new owner, a spot that really moved, a new direction or chosen bus is a new approach: buses already alerted for the old setup may alert again.
  const old = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  const changed =
    old &&
    (old.commuterId !== data.commuterId ||
      distanceM([old.spotLng, old.spotLat], [data.spotLng, data.spotLat]) > SPOT_MOVED_M ||
      old.direction !== direction ||
      old.targetBusId !== targetBusId);

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: changed ? { ...data, notifiedBusIds: [] } : data,
    create: { endpoint, ...data },
  });

  return res.status(201).json({ ok: true });
};

// Idempotent: removing a subscription that is already gone is not an error. Only the owner's row can be removed.
const unsubscribe = async (req, res) => {
  await prisma.pushSubscription.deleteMany({ where: { endpoint: req.body.endpoint, commuterId: req.user.id } });
  return res.json({ ok: true });
};

export { subscribe, unsubscribe };
