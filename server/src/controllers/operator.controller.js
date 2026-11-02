import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";
import { OPERATOR_COOKIE, cookieMaxAgeMs, cookieOptions, hashToken, signOperatorToken, verifyToken } from "../utils/token.js";

// Compared when the user does not exist, so an unknown username takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("00000000", 10);

const profile = ({ id, name, username, companyName }) => ({ id, name, username, companyName });

// Unknown user, a driver account, a disabled account, no password and a wrong password all give the same answer.
const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username }, include: { company: { select: { name: true } } } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || user.role !== "OPERATOR" || !user.active || !user.passwordHash || !passwordOk) {
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

export { login, logout, me };
