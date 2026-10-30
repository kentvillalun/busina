import { Router } from "express";
import { listBuses } from "../controllers/bus.controller.js";

const router = Router();

router.get("/", listBuses);

export default router;
