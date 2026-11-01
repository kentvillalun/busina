import { Router } from "express";
import passport from "passport";
import { checkState, finishLogin, googleStart, logout, me } from "../controllers/auth.controller.js";
import { authenticateCommuter } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { logoutSchema } from "../schemas/auth.schema.js";

const router = Router();

// Sign-in is Google's redirect flow, so these are plain GETs with no body to validate.
router.get("/google", authLimiter, googleStart);
router.get(
  "/google/callback",
  authLimiter,
  checkState,
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=google" }),
  finishLogin,
);

router.post("/logout", validate(logoutSchema), authLimiter, logout);
router.get("/me", authenticateCommuter, me);

export default router;
