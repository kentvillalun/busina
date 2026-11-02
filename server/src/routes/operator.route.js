import { Router } from "express";
import { fleet, login, logout, me } from "../controllers/operator.controller.js";
import { authenticateOperator } from "../middlewares/auth.js";
import { authLimiter, operatorLoginLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../schemas/operator.schema.js";

const router = Router();

// Validate first (the limiter keys on the cleaned username), then the failed-password limit, then the controller.
router.post("/login", validate(loginSchema), operatorLoginLimiter, login);
router.post("/logout", authLimiter, logout);
router.get("/me", authenticateOperator, me);
router.get("/fleet", authenticateOperator, fleet);

export default router;
