import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Runtime uses the POOLED Neon URL (host contains -pooler).
// connect_timeout=15 in the URL helps when Neon wakes from sleep.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  adapter,
});

// Neon may be asleep on the first connection, so retry a few times before giving up.
const connectDB = async (attempts = 5, delayMs = 3000) => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is empty. Add your Neon pooled connection string to server/.env");
    return false;
  }
  for (let i = 1; i <= attempts; i++) {
    try {
      // With a driver adapter $connect() is lazy, so run a real query to prove the database answers.
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log("DB connected via Prisma");
      return true;
    } catch (error) {
      console.error(`DB connection attempt ${i}/${attempts} failed: ${error.message}`);
      if (i < attempts) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
