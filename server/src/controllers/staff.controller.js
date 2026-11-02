import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { getRoute } from "../services/routeCache.js";
import { busOnRoad, roadFor, STALE_AFTER_MS } from "../utils/eta.js";
import { snapToRoute } from "../utils/geo.js";
import { HttpError } from "../utils/HttpError.js";
import { groupPickups } from "../utils/pickups.js";
import { STAFF_COOKIE, cookieMaxAgeMs, cookieOptions, hashToken, signStaffToken, verifyToken } from "../utils/token.js";

// Compared when the bus does not exist, so an unknown bus code takes as long as a wrong PIN and cannot be told apart by timing.
const DUMMY_HASH = bcrypt.hashSync("00000000", 10);

// Unknown bus, no PIN set, disabled bus and wrong PIN all give the same answer.
// shortcut: bus codes are unique per company and there is one company, so the first match is the bus; with a second company, sign in with a company code too.
const login = async (req, res) => {
  const { busNumber, pin } = req.body;

  const bus = await prisma.bus.findFirst({ where: { busNumber } });
  const pinOk = await bcrypt.compare(pin, bus?.pinHash ?? DUMMY_HASH);
  if (!bus || !bus.pinHash || !bus.active || !pinOk) {
    throw new HttpError(401, "Wrong bus code or PIN", { code: "INVALID_CREDENTIALS" });
  }

  const token = signStaffToken(bus);
  res.cookie(STAFF_COOKIE, token, { ...cookieOptions, maxAge: cookieMaxAgeMs(token) });
  return res.json({ bus: { id: bus.id, busNumber: bus.busNumber, name: bus.name } });
};

// Always succeeds: signing out twice, or with a broken cookie, is not an error.
const logout = async (req, res) => {
  const token = req.cookies[STAFF_COOKIE];
  res.clearCookie(STAFF_COOKIE, cookieOptions);

  if (token) {
    try {
      const { exp } = verifyToken(token, { ignoreExpiration: true });
      // A token that is already expired needs no entry: it is rejected anyway.
      if (exp * 1000 > Date.now()) {
        await prisma.blacklistedToken.upsert({
          where: { tokenHash: hashToken(token) },
          update: {},
          create: { tokenHash: hashToken(token), expiresAt: new Date(exp * 1000) },
        });
      }
    } catch {
      // forged or malformed: nothing to revoke
    }
  }

  await prisma.blacklistedToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }); // keeps the table from growing
  return res.json({ ok: true });
};

const me = (req, res) => {
  const { busId, busNumber, name } = req.user;
  return res.json({ bus: { id: busId, busNumber, name } });
};

const SPOT_MAX_FROM_ROAD_M = 1000; // a saved spot farther than this from the road is not on this route (same limit as etaFor)

// Everything the driver screen needs in one poll: the bus, where it is, and who is waiting ahead.
// The bus comes from the token (req.user.busId), never from the URL, so a driver can only ever see their own bus.
// Pickups are the commuters who tapped "Share with drivers" (WaitingSpot, 30 minutes) and nobody else: anonymous, only where
// and how many, never who (no commuter id leaves the database). Alert spots (PushSubscription) are never shown to drivers.
const overview = async (req, res) => {
  const bus = await prisma.bus.findUnique({
    where: { id: req.user.busId },
    select: { id: true, busNumber: true, name: true, routeId: true, serviceStatus: true, state: true },
  });
  const summary = { id: bus.id, busNumber: bus.busNumber, name: bus.name, routeId: bus.routeId, serviceStatus: bus.serviceStatus };
  const { state } = bus;
  const route = state ? await getRoute(bus.routeId) : null;
  if (!state || !route) return res.json({ serverTime: new Date().toISOString(), bus: summary, position: null, pickups: null });

  const { snapped, offRoute, progressM, speedKmh } = busOnRoad(state, route);
  const stale = Date.now() - state.lastPingAt.getTime() > STALE_AFTER_MS;
  const position = {
    lat: offRoute ? state.lat : snapped.lat,
    lng: offRoute ? state.lng : snapped.lng,
    direction: state.direction,
    speedKmh,
    progressM,
    offRoute,
    stale,
    lastPingAt: state.lastPingAt,
  };

  // No honest pickups without a fresh position on the road and a direction, or while the bus is off duty.
  let pickups = null;
  if (!stale && !offRoute && state.direction && bus.serviceStatus !== "AT_REST") {
    const waiting = await prisma.waitingSpot.findMany({
      where: { direction: state.direction, expiresAt: { gt: new Date() } },
      select: { lat: true, lng: true },
    });
    const road = roadFor(route, state.direction);
    // shortcut: every route's commuters are considered; with a second route, filter by it.
    const spots = waiting
      .map((spot) => snapToRoute([spot.lng, spot.lat], road))
      .filter((spot) => spot && spot.distanceFromRouteM <= SPOT_MAX_FROM_ROAD_M);
    pickups = groupPickups({ busProgressM: progressM, direction: state.direction, spots });
  }

  return res.json({ serverTime: new Date().toISOString(), bus: summary, position, pickups });
};

const setStatus = async (req, res) => {
  const bus = await prisma.bus.update({
    where: { id: req.user.busId },
    data: { serviceStatus: req.body.status },
    select: { serviceStatus: true },
  });
  return res.json({ serviceStatus: bus.serviceStatus });
};

export { login, logout, me, overview, setStatus };
