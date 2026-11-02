import { Router } from "express";
import { login, logout, me } from "../controllers/staff.controller.js";
import { authenticateStaff } from "../middlewares/auth.js";
import { authLimiter, staffLoginLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../schemas/staff.schema.js";

const router = Router();

// Validate first (the limiter keys on the cleaned bus code), then the failed-PIN limit, then the controller.
router.post("/login", validate(loginSchema), staffLoginLimiter, login);
router.post("/logout", authLimiter, logout);
router.get("/me", authenticateStaff, me);

export default router;
