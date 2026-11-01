import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const COMMUTER_COOKIE = "commuter_token";

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

// Throws when the token is expired, tampered with, or signed with another algorithm.
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

// The blacklist keeps this, not the token, so a leaked table cannot be replayed as sessions.
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// The cookie lives exactly as long as the token.
const cookieMaxAgeMs = (token) => {
  const { exp } = jwt.decode(token);
  return exp * 1000 - Date.now();
};

export { COMMUTER_COOKIE, cookieOptions, signCommuterToken, verifyToken, hashToken, cookieMaxAgeMs };
