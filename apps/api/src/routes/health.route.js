import { Router } from "express";
import { prisma } from "../config/db.js";

const router = Router();

router.get("/health", async (_req, res) => {
  let db = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    db = "unreachable";
  }
  res.json({ status: "ok", service: "busina-api", db });
});

export default router;
