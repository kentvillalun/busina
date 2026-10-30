import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB, disconnectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import { generalLimiter } from "./middlewares/rateLimit.js";
import busRoute from "./routes/bus.route.js";
import deviceRoute from "./routes/device.route.js";
import healthRoute from "./routes/health.route.js";
import routesRoute from "./routes/routes.route.js";

const app = express();

// Behind Render's proxy every client would share one IP (and one rate-limit counter) without this.
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(helmet());

// The mobile app sends no browser origin; CORS only matters for a web client.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "100kb" }));

app.use(generalLimiter);

app.use("/", healthRoute);
app.use("/device", deviceRoute);
app.use("/buses", busRoute);
app.use("/routes", routesRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});

// Connect in the background so a sleeping Neon database does not block startup.
connectDB();

// After an unhandled error the process state is unknown, so shut down cleanly and let Render restart it.
// open connections (keep-alive, later WebSockets) can stall server.close(), so force exit after 10s.
const shutdown = (code) => {
  setTimeout(() => process.exit(code), 10000).unref();
  server.close(async () => {
    await disconnectDB();
    process.exit(code);
  });
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown(1);
});

// Render sends SIGTERM on every deploy.
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  shutdown(0);
});
