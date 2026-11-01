import crypto from "node:crypto";
import passport from "passport";
import { prisma } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";
import { safeNext } from "../utils/safeNext.js";
import { COMMUTER_COOKIE, cookieMaxAgeMs, cookieOptions, hashToken, signCommuterToken, verifyToken } from "../utils/token.js";

const STATE_COOKIE = "oauth_state";
const NEXT_COOKIE = "oauth_next";
const OAUTH_COOKIE_MS = 10 * 60 * 1000;

// Step 1: remember a random `state` and the page the commuter wanted, then send them to Google.
// Passport's own state check needs a session, so we keep the state in a short-lived cookie and compare it in checkState.
const googleStart = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) throw new HttpError(503, "Google sign-in is not set up", { code: "GOOGLE_NOT_CONFIGURED" });

  const state = crypto.randomBytes(16).toString("hex");
  const oauthCookie = { ...cookieOptions, maxAge: OAUTH_COOKIE_MS };
  res.cookie(STATE_COOKIE, state, oauthCookie);
  res.cookie(NEXT_COOKIE, safeNext(req.query.next), oauthCookie);

  return passport.authenticate("google", { scope: ["profile", "email"], session: false, state })(req, res, next);
};

// Step 2, before Passport trusts the code: the state Google echoes back must be the one we set in this browser.
const checkState = (req, res, next) => {
  const expected = req.cookies[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, cookieOptions);
  if (!expected || expected !== req.query.state) return res.redirect("/login?error=state");
  next();
};

// Step 3, after Passport found or created the Commuter (req.user): our own session cookie, then back to the page.
const finishLogin = (req, res) => {
  const token = signCommuterToken(req.user);
  res.cookie(COMMUTER_COOKIE, token, { ...cookieOptions, maxAge: cookieMaxAgeMs(token) });

  const next = safeNext(req.cookies[NEXT_COOKIE]);
  res.clearCookie(NEXT_COOKIE, cookieOptions);
  return res.redirect(next);
};

// Always succeeds: logging out twice, or with a broken cookie, is not an error.
const logout = async (req, res) => {
  const token = req.cookies[COMMUTER_COOKIE];
  res.clearCookie(COMMUTER_COOKIE, cookieOptions);

  if (token) {
    try {
      // An expired session still says who owned it, so its push subscription is removed too.
      const { id, exp } = verifyToken(token, { ignoreExpiration: true });

      // Only the subscription of the browser that is signing out: the same commuter's other phones keep their alerts.
      const endpoint = req.body?.endpoint;
      if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint, commuterId: id } });

      // A token that is already expired needs no entry: it is rejected anyway.
      if (exp * 1000 > Date.now()) {
        await prisma.blacklistedToken.upsert({
          where: { tokenHash: hashToken(token) },
          update: {},
          create: { tokenHash: hashToken(token), expiresAt: new Date(exp * 1000) },
        });
      }
    } catch {
      // forged or malformed: nothing to remove
    }
  }

  await prisma.blacklistedToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }); // keeps the table from growing
  return res.json({ ok: true });
};

const me = (req, res) => {
  const { id, email, name } = req.user;
  return res.json({ commuter: { id, email, name } });
};

export { googleStart, checkState, finishLogin, logout, me };
