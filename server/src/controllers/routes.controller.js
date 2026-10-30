import { prisma } from "../config/db.js";

// GET /routes: public. The roads the buses follow, to draw on the map. Points are [lng, lat], first terminal to last.
// `polylineNorthbound` is the road for northbound buses when it differs from `polyline`, otherwise null.
const listRoutes = async (req, res) => {
  const routes = await prisma.route.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, lengthM: true, polyline: true, polylineNorthbound: true },
  });

  return res.json({ routes });
};

export { listRoutes };
