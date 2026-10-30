import { Router } from "express";
import { listRoutes } from "../controllers/routes.controller.js";

const router = Router();

router.get("/", listRoutes);

export default router;
