import { prisma } from "../config/db.js";

// GET /routes: public. The road each bus follows, to draw on the map. Points are [lng, lat].
const listRoutes = async (req, res) => {
  const routes = await prisma.route.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, lengthM: true, polyline: true },
  });

  return res.json({ routes });
};

export { listRoutes };
