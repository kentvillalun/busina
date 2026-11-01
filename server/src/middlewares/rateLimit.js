import rateLimit from "express-rate-limit";
import { HttpError } from "../utils/HttpError.js";

// Counters live in memory: fine for one server, reset on restart.
const onLimit = (message) => {
  return (req, res, next) => next(new HttpError(429, message));
};

// Per IP, generous on purpose: buses on mobile data can share one carrier IP.
const generalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("Too many requests, please slow down"),
});

// Per device, so it must run after deviceAuth (needs req.bus). A real ESP32 pings every 3-5 s;
// 60/min leaves room for retries but stops a firmware loop or a stolen key from hammering the database.
const devicePingLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  keyGenerator: (req) => `bus:${req.bus.id}`,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("This device is sending too many updates"),
});

// Per IP. A commuter changes the spot or minutes a few times at most; anything faster is a script filling the table.
const pushLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("Too many alert changes, please slow down"),
});

// Per IP, for the sign-in redirects and logout. Each login uses two requests; 20 a minute leaves room for a shared Wi-Fi.
const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("Too many sign-in attempts, please wait a minute"),
});

export { generalLimiter, devicePingLimiter, pushLimiter, authLimiter };
