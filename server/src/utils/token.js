import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const COMMUTER_COOKIE = "commuter_token";
// A different cookie name and role per portal, so a commuter token can never open the driver app or the other way round.
const STAFF_COOKIE = "staff_token";

// Same options for setting and clearing: a cookie is only cleared when path/sameSite/secure match.
// "lax" works because the browser only talks to the client's own domain (/api is a rewrite), so this cookie is first-party.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const signCommuterToken = (commuter) =>
  jwt.sign({ id: commuter.id, role: "COMMUTER" }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// A driver signs in as the bus. 12 hours is one shift, so the next shift signs in again.
const signStaffToken = (bus) =>
  jwt.sign({ id: bus.id, role: "DRIVER", busId: bus.id }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.STAFF_JWT_EXPIRES_IN || "12h",
  });

// Throws when the token is expired, tampered with, or signed with another algorithm.
// { ignoreExpiration: true } still checks the signature; logout uses it to find the owner of an expired session.
const verifyToken = (token, options = {}) =>
  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], ...options });

// The blacklist keeps this, not the token, so a leaked table cannot be replayed as sessions.
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// The cookie lives exactly as long as the token.
const cookieMaxAgeMs = (token) => {
  const { exp } = jwt.decode(token);
  return exp * 1000 - Date.now();
};

export { COMMUTER_COOKIE, STAFF_COOKIE, cookieOptions, signCommuterToken, signStaffToken, verifyToken, hashToken, cookieMaxAgeMs };
