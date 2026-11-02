import { prisma } from "../config/db.js";

// How long one "yes" lasts. After this the marker disappears from the drivers' maps on its own.
const SHARE_MS = 30 * 60_000;

// The commuter agreed (the app asks first) to let drivers see where they wait. One row per commuter, so sharing again moves
// it and restarts the 30 minutes.
const share = async (req, res) => {
  const { lat, lng, direction } = req.body;
  const expiresAt = new Date(Date.now() + SHARE_MS);

  await prisma.waitingSpot.upsert({
    where: { commuterId: req.user.id },
    update: { lat, lng, direction, expiresAt },
    create: { commuterId: req.user.id, lat, lng, direction, expiresAt },
  });
  await prisma.waitingSpot.deleteMany({ where: { expiresAt: { lt: new Date() } } }); // keeps the table from growing

  return res.status(201).json({ sharing: true, expiresAt });
};

// Idempotent: stopping when nothing is shared is not an error.
const stop = async (req, res) => {
  await prisma.waitingSpot.deleteMany({ where: { commuterId: req.user.id } });
  return res.json({ sharing: false });
};

const status = async (req, res) => {
  const spot = await prisma.waitingSpot.findFirst({
    where: { commuterId: req.user.id, expiresAt: { gt: new Date() } },
    select: { expiresAt: true },
  });
  return res.json({ sharing: Boolean(spot), expiresAt: spot?.expiresAt ?? null });
};

export { share, status, stop };
