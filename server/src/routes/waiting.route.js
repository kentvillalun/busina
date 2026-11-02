import { Router } from "express";
import { share, status, stop } from "../controllers/waiting.controller.js";
import { authenticateCommuter } from "../middlewares/auth.js";
import { waitingLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { shareSchema } from "../schemas/waiting.schema.js";

const router = Router();

// Only a signed-in commuter can share, and only their own marker: validate, authenticate, the per-commuter limit, the controller.
router.put("/", validate(shareSchema), authenticateCommuter, waitingLimiter, share);
router.delete("/", authenticateCommuter, waitingLimiter, stop);
router.get("/", authenticateCommuter, status);

export default router;
