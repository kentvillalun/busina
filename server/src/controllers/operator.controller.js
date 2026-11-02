import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { prisma } from "../config/db.js";
import { getRoute } from "../services/routeCache.js";
import { fleetBus } from "../utils/fleet.js";
import { HttpError } from "../utils/HttpError.js";
import { canOperate } from "../utils/operatorUser.js";
import { busParamsSchema } from "../schemas/operator.schema.js";
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
const fleet = async (req, res) => {
  const buses = await prisma.bus.findMany({
    where: { companyId: req.user.companyId },
    orderBy: { busNumber: "asc" },
    select: { id: true, busNumber: true, name: true, seatCount: true, serviceStatus: true, active: true, routeId: true, route: { select: { name: true } }, state: true },
  });

  // Each route is read once, before the buses are mapped: on a cold cache, asking per bus would read the same long polylines many times at once.
  const routeIds = [...new Set(buses.filter((bus) => bus.state).map((bus) => bus.routeId))];
  const roads = new Map(await Promise.all(routeIds.map(async (id) => [id, await getRoute(id)])));

  const now = Date.now();
  return res.json({ serverTime: new Date(now).toISOString(), buses: buses.map((bus) => fleetBus(bus, roads.get(bus.routeId), now)) });
};

// The bus comes from the URL, but only a bus of the operator's own company is found: another company's id answers 404, the same
// as an id that does not exist, so nobody can learn which ids exist elsewhere.
const ownBus = async (req) => {
  const { id } = busParamsSchema.parse(req.params);
  const bus = await prisma.bus.findFirst({ where: { id, companyId: req.user.companyId }, select: { id: true, busNumber: true } });
  if (!bus) throw new HttpError(404, "Bus not found");
  return bus;
};

// A new random 6-digit PIN. Only its bcrypt hash is stored; the PIN itself is in this one answer and nowhere else.
// A driver who is already signed in stays signed in until the shift token ends (12 h); disabling the bus ends that at once.
const resetPin = async (req, res) => {
  const bus = await ownBus(req);
  const pin = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.bus.update({ where: { id: bus.id }, data: { pinHash: await bcrypt.hash(pin, 10) } });
  res.set("Cache-Control", "no-store");
  return res.json({ busNumber: bus.busNumber, pin });
};

// A disabled bus cannot be signed in to (authenticateStaff checks `active` on every request, so a driver is out at once) and
// commuters no longer see it (GET /buses lists active buses only).
const setBusActive = async (req, res) => {
  const bus = await ownBus(req);
  const { active } = await prisma.bus.update({ where: { id: bus.id }, data: { active: req.body.active }, select: { active: true } });
  return res.json({ busNumber: bus.busNumber, active });
};

export { login, logout, me, fleet, resetPin, setBusActive };
