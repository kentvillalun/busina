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

export { generalLimiter, devicePingLimiter };
