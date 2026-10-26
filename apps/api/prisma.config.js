import { defineConfig } from "prisma/config";
import "dotenv/config";

// The Prisma CLI (migrate, studio) uses the DIRECT Neon connection string.
// Migrations fail through the pooler. Falls back to DATABASE_URL for a local Postgres.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"] || process.env["DATABASE_URL"],
  },
});
