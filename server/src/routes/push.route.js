import { Router } from "express";
import { subscribe, unsubscribe } from "../controllers/push.controller.js";
import { pushLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { subscribeSchema, unsubscribeSchema } from "../schemas/push.schema.js";

const router = Router();

// Anonymous (commuters have no account), so there is no auth step: validate, then the per-IP limit, then the controller.
router.post("/subscribe", validate(subscribeSchema), pushLimiter, subscribe);
router.delete("/subscribe", validate(unsubscribeSchema), pushLimiter, unsubscribe);

export default router;
