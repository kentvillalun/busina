import { prisma } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";
import { COMMUTER_COOKIE, cookieOptions, hashToken, verifyToken } from "../utils/token.js";

// Stub for the login slice (drivers, conductors, operators). Devices use deviceAuth instead.
// TODO: verify the Bearer JWT, load the user, set req.user = { id, role, companyId }.
const authenticate = async (req, res, next) => {
  return next(new HttpError(501, "Authentication is not implemented yet"));
};

// A cookie that failed any check is removed, so the browser stops sending a dead session.
const rejectSession = (res, next, message, code) => {
  res.clearCookie(COMMUTER_COOKIE, cookieOptions);
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

  if (await prisma.blacklistedToken.findUnique({ where: { tokenHash: hashToken(token) } })) {
    return rejectSession(res, next, "Invalid session", "INVALID_SESSION");
  }

  // Reloaded on every request so a disabled or deleted account stops working at once, not when the token expires.
  const commuter = await prisma.commuter.findUnique({ where: { id: payload.id } });
  if (!commuter?.active) return rejectSession(res, next, "Invalid session", "INVALID_SESSION");

  req.user = { id: commuter.id, role: "COMMUTER", email: commuter.email, name: commuter.name };
  next();
};

// requireRoles(["DRIVER", "CONDUCTOR"]); must run after authenticate, which sets req.user.
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

export { authenticate, authenticateCommuter, requireRoles };
