import { prisma } from "../config/db.js";

// A route changes only when someone edits it, so a few minutes in memory saves a read of two long polylines on every ping.
// shortcut: per process; with more than one server instance an edited route shows up after at most this long.
const ROUTE_CACHE_MS = 10 * 60_000;
const routes = new Map(); // routeId -> { route, loadedAt }

const getRoute = async (routeId) => {
  const cached = routes.get(routeId);
  if (cached && Date.now() - cached.loadedAt < ROUTE_CACHE_MS) return cached.route;
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    select: { polyline: true, polylineNorthbound: true },
  });
  routes.set(routeId, { route, loadedAt: Date.now() });
  return route;
};

export { getRoute };
