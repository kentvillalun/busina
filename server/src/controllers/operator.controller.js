import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { getRoute } from "../services/routeCache.js";
import { busOnRoad } from "../utils/eta.js";
import { fleetStatus, isFresh } from "../utils/fleet.js";
import { HttpError } from "../utils/HttpError.js";
import { canOperate } from "../utils/operatorUser.js";
import { OPERATOR_COOKIE, cookieMaxAgeMs, cookieOptions, hashToken, signOperatorToken, verifyToken } from "../utils/token.js";

// Compared when the user does not exist, so an unknown username takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("00000000", 10);

const profile = ({ id, name, username, companyName }) => ({ id, name, username, companyName });

// Unknown user, a driver account, a disabled account, no password and a wrong password all give the same answer.
const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username }, include: { company: { select: { name: true } } } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!canOperate(user) || !passwordOk) {
    throw new HttpError(401, "Wrong username or password", { code: "INVALID_CREDENTIALS" });
  }

  const token = signOperatorToken(user);
  res.cookie(OPERATOR_COOKIE, token, { ...cookieOptions, maxAge: cookieMaxAgeMs(token) });
  return res.json({ operator: profile({ id: user.id, name: `${user.firstName} ${user.lastName}`, username: user.username, companyName: user.company.name }) });
};

// Always succeeds: signing out twice, or with a broken cookie, is not an error.
const logout = async (req, res) => {
  const token = req.cookies[OPERATOR_COOKIE];
  res.clearCookie(OPERATOR_COOKIE, cookieOptions);

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

const me = (req, res) => res.json({ operator: profile(req.user) });

// Every bus of the operator's company, scoped by the company on the signed-in user, never by anything in the request.
// Seats and speed are only given for a fresh ping; a silent bus keeps its last known position so the map can show where it went quiet.
// Never returns deviceId, deviceKeyHash or pinHash.
const fleet = async (req, res) => {
  const buses = await prisma.bus.findMany({
    where: { companyId: req.user.companyId },
    orderBy: { busNumber: "asc" },
    select: { id: true, busNumber: true, name: true, seatCount: true, serviceStatus: true, active: true, routeId: true, route: { select: { name: true } }, state: true },
  });

  const now = Date.now();
  const data = await Promise.all(
    buses.map(async ({ state, serviceStatus, routeId, route, ...bus }) => {
      const result = { ...bus, routeName: route.name, status: fleetStatus({ serviceStatus, state }, now), direction: null, position: null, speedKmh: null, seatsFree: null, lastPingAt: null };
      if (!state) return result;

      const { snapped, offRoute, speedKmh } = busOnRoad(state, await getRoute(routeId));
      result.direction = state.direction;
      result.position = { lat: offRoute ? state.lat : snapped.lat, lng: offRoute ? state.lng : snapped.lng };
      result.lastPingAt = state.lastPingAt;
      if (isFresh(state, now)) {
        result.speedKmh = speedKmh;
        result.seatsFree = bus.seatCount - state.occupied;
      }
      return result;
    }),
  );

  return res.json({ serverTime: new Date(now).toISOString(), buses: data });
};

export { login, logout, me, fleet };
