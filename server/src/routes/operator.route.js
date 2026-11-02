import { Router } from "express";
import { fleet, login, logout, me, resetPin, setBusActive } from "../controllers/operator.controller.js";
import { authenticateOperator } from "../middlewares/auth.js";
import { authLimiter, operatorActionLimiter, operatorLoginLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { activeSchema, loginSchema } from "../schemas/operator.schema.js";

const router = Router();

// Validate first (the limiter keys on the cleaned username), then the failed-password limit, then the controller.
router.post("/login", validate(loginSchema), operatorLoginLimiter, login);
router.post("/logout", authLimiter, logout);
router.get("/me", authenticateOperator, me);
router.get("/fleet", authenticateOperator, fleet);

// Bus actions: the bus id in the URL is looked up inside the operator's own company, never trusted on its own.
router.post("/buses/:id/reset-pin", authenticateOperator, operatorActionLimiter, resetPin);
router.patch("/buses/:id/active", validate(activeSchema), authenticateOperator, operatorActionLimiter, setBusActive);

export default router;
