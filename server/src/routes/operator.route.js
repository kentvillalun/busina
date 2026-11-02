import { Router } from "express";
import { createStaff, fleet, listStaff, login, logout, me, resetPin, setBusActive, updateStaff } from "../controllers/operator.controller.js";
import { authenticateOperator } from "../middlewares/auth.js";
import { authLimiter, operatorActionLimiter, operatorLoginLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { activeSchema, createStaffSchema, loginSchema, updateStaffSchema } from "../schemas/operator.schema.js";

const router = Router();

// Validate first (the limiter keys on the cleaned username), then the failed-password limit, then the controller.
router.post("/login", validate(loginSchema), operatorLoginLimiter, login);
router.post("/logout", authLimiter, logout);
router.get("/me", authenticateOperator, me);
router.get("/fleet", authenticateOperator, fleet);

// Bus actions: the bus id in the URL is looked up inside the operator's own company, never trusted on its own.
router.post("/buses/:id/reset-pin", authenticateOperator, operatorActionLimiter, resetPin);
router.patch("/buses/:id/active", validate(activeSchema), authenticateOperator, operatorActionLimiter, setBusActive);

// The staff roster (records only; staff do not sign in). Every query is limited to the operator's company.
router.get("/staff", authenticateOperator, listStaff);
router.post("/staff", validate(createStaffSchema), authenticateOperator, operatorActionLimiter, createStaff);
router.patch("/staff/:id", validate(updateStaffSchema), authenticateOperator, operatorActionLimiter, updateStaff);

export default router;
