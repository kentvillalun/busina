import { Router } from "express";
import { subscribe, unsubscribe } from "../controllers/push.controller.js";
import { authenticateCommuter } from "../middlewares/auth.js";
import { pushLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { subscribeSchema, unsubscribeSchema } from "../schemas/push.schema.js";

const router = Router();

// A subscription belongs to a signed-in commuter: validate, then authenticate, then the per-IP limit, then the controller.
router.post("/subscribe", validate(subscribeSchema), authenticateCommuter, pushLimiter, subscribe);
router.delete("/subscribe", validate(unsubscribeSchema), authenticateCommuter, pushLimiter, unsubscribe);

export default router;
