import { prisma } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";
import { COMMUTER_COOKIE, STAFF_COOKIE, cookieOptions, hashToken, verifyToken } from "../utils/token.js";

// A cookie that failed any check is removed, so the browser stops sending a dead session.
const rejectSession = (res, next, message, code, cookie = COMMUTER_COOKIE) => {
  res.clearCookie(cookie, cookieOptions);
  return next(new HttpError(401, message, { code }));
};

// Commuter session: the JWT in the commuter_token cookie. Sets req.user = { id, role: "COMMUTER", email, name }.
const authenticateCommuter = async (req, res, next) => {
  const token = req.cookies?.[COMMUTER_COOKIE];
  if (!token) return next(new HttpError(401, "Sign in to continue"));

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    return error.name === "TokenExpiredError"
      ? rejectSession(res, next, "Your session expired, please sign in again", "SESSION_EXPIRED")
      : rejectSession(res, next, "Invalid session", "INVALID_SESSION");
  }

  // A token of another portal (a driver's) is never a commuter session, whatever cookie it came in.
  if (payload.role !== "COMMUTER") return rejectSession(res, next, "Invalid session", "INVALID_SESSION");

  if (await prisma.blacklistedToken.findUnique({ where: { tokenHash: hashToken(token) } })) {
    return rejectSession(res, next, "Invalid session", "INVALID_SESSION");
  }

  // Reloaded on every request so a disabled or deleted account stops working at once, not when the token expires.
  const commuter = await prisma.commuter.findUnique({ where: { id: payload.id } });
  if (!commuter?.active) return rejectSession(res, next, "Invalid session", "INVALID_SESSION");

  req.user = { id: commuter.id, role: "COMMUTER", email: commuter.email, name: commuter.name };
  next();
};

// Driver session: the JWT in the staff_token cookie. The driver is the bus, so this sets
// req.user = { id: busId, role: "DRIVER", busId, busNumber, name } and a driver can only ever act on that bus.
const authenticateStaff = async (req, res, next) => {
  const token = req.cookies?.[STAFF_COOKIE];
  if (!token) return next(new HttpError(401, "Sign in to continue"));

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    return error.name === "TokenExpiredError"
      ? rejectSession(res, next, "Your session expired, please sign in again", "SESSION_EXPIRED", STAFF_COOKIE)
      : rejectSession(res, next, "Invalid session", "INVALID_SESSION", STAFF_COOKIE);
  }

  if (payload.role !== "DRIVER") return rejectSession(res, next, "Invalid session", "INVALID_SESSION", STAFF_COOKIE);

  if (await prisma.blacklistedToken.findUnique({ where: { tokenHash: hashToken(token) } })) {
    return rejectSession(res, next, "Invalid session", "INVALID_SESSION", STAFF_COOKIE);
  }

  // A bus that was disabled, or whose PIN was removed, stops working at once, not when the token expires.
  const bus = await prisma.bus.findUnique({ where: { id: payload.busId } });
  if (!bus?.active || !bus.pinHash) return rejectSession(res, next, "Invalid session", "INVALID_SESSION", STAFF_COOKIE);

  req.user = { id: bus.id, role: "DRIVER", busId: bus.id, busNumber: bus.busNumber, name: bus.name };
  next();
};

// requireRoles(["DRIVER"]); must run after an authenticate middleware, which sets req.user.
const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to do this"));
    }

    next();
  };
};

export { authenticateCommuter, authenticateStaff, requireRoles };
