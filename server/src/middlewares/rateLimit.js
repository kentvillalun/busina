import rateLimit, { ipKeyGenerator } from "express-rate-limit";
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

// Per commuter (so it runs after authenticateCommuter). Each test is a real push through Apple or Google: a few are plenty.
const pushTestLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  keyGenerator: (req) => `push-test:${req.user.id}`,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("Please wait a minute before sending another test"),
});

// Per IP, for the sign-in redirects and logout. Each login uses two requests; 20 a minute leaves room for a shared Wi-Fi.
const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("Too many sign-in attempts, please wait a minute"),
});

// Driver PIN guesses: only failed attempts count, 5 per 15 minutes for each IP and bus code (so it runs after validate,
// which cleans req.body). A short numeric PIN is the weak spot, so this is what makes guessing it impractical.
// shortcut: counted per IP, so many IPs together could still guess; add a per-bus failure count if that matters.
const staffLoginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `staff-login:${ipKeyGenerator(req.ip)}:${req.body.busNumber}`,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("Too many wrong PINs, please try again in 15 minutes"),
});

// Per signed-in bus (so it runs after authenticateStaff). A driver taps a toggle now and then; more is a stuck button or a script.
const staffActionLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  keyGenerator: (req) => `staff:${req.user.id}`,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: onLimit("Too many changes, please slow down"),
});

export { generalLimiter, devicePingLimiter, pushLimiter, pushTestLimiter, authLimiter, staffLoginLimiter, staffActionLimiter };
