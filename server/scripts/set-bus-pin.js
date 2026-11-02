// Sets (or rotates) the driver sign-in PIN of one bus: `npm run bus:pin -- 0015`.
// The PIN is random, only its bcrypt hash goes to the database, and the PIN itself is saved to server/.env
// (git-ignored) as DRIVER_PIN_<bus code>. It is never printed. Run it again to rotate: the old PIN stops working.
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { disconnectDB, prisma } from "../src/config/db.js";

const ENV_PATH = new URL("../.env", import.meta.url);

const busNumber = process.argv[2];
if (!busNumber) {
  console.error("Usage: npm run bus:pin -- <bus code>");
  process.exit(1);
}

const saveToEnv = (key, value) => {
  const current = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const next = pattern.test(current) ? current.replace(pattern, line) : current + (current && !current.endsWith("\n") ? "\n" : "") + line + "\n";
  writeFileSync(ENV_PATH, next);
};

async function main() {
  const bus = await prisma.bus.findFirst({ where: { busNumber } });
  if (!bus) throw new Error(`No bus with code ${busNumber}`);

  const pin = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.bus.update({ where: { id: bus.id }, data: { pinHash: await bcrypt.hash(pin, 10) } });

  const key = `DRIVER_PIN_${busNumber}`;
  saveToEnv(key, pin);
  console.log(`New PIN for bus ${busNumber} saved to server/.env as ${key}.`);
}

main()
  .catch((error) => {
    console.error("Could not set the PIN:", error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
