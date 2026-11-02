import { Router } from "express";
import { login, logout, me, overview, setStatus } from "../controllers/staff.controller.js";
import { authenticateStaff } from "../middlewares/auth.js";
import { authLimiter, staffActionLimiter, staffLoginLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, statusSchema } from "../schemas/staff.schema.js";

const router = Router();

// Validate first (the limiter keys on the cleaned bus code), then the failed-PIN limit, then the controller.
router.post("/login", validate(loginSchema), staffLoginLimiter, login);
router.post("/logout", authLimiter, logout);
router.get("/me", authenticateStaff, me);

// The driver screen. Every one acts on the bus in the token, nothing else.
router.get("/overview", authenticateStaff, overview);
router.patch("/status", validate(statusSchema), authenticateStaff, staffActionLimiter, setStatus);

export default router;
