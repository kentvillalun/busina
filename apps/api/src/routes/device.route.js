import { Router } from "express";
import { ping } from "../controllers/device.controller.js";
import { deviceAuth } from "../middlewares/deviceAuth.js";
import { devicePingLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { pingSchema } from "../schemas/device.schema.js";

const router = Router();

// Order matters: validate before the database lookup; the per-device limit needs req.bus from deviceAuth.
router.post("/ping", validate(pingSchema), deviceAuth, devicePingLimiter, ping);

export default router;
