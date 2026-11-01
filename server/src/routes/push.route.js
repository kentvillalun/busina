import { Router } from "express";
import { subscribe, test, unsubscribe } from "../controllers/push.controller.js";
import { authenticateCommuter } from "../middlewares/auth.js";
import { pushLimiter, pushTestLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { subscribeSchema, testSchema, unsubscribeSchema } from "../schemas/push.schema.js";

const router = Router();

// A subscription belongs to a signed-in commuter: validate, then authenticate, then the per-IP limit, then the controller.
router.post("/subscribe", validate(subscribeSchema), authenticateCommuter, pushLimiter, subscribe);
router.delete("/subscribe", validate(unsubscribeSchema), authenticateCommuter, pushLimiter, unsubscribe);
router.post("/test", validate(testSchema), authenticateCommuter, pushTestLimiter, test);

export default router;
