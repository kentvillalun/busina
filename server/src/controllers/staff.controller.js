import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";
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

export { login, logout, me };
