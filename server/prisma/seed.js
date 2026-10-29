// Demo data for development: one company, one test route, one bus and one operator.
// Run with `npm run seed` (it loads server/.env). Safe to run more than once.
//
// Secrets: the device key and the operator password are random, hashed before they reach the
// database, and written to server/.env (git-ignored). They are never printed or committed.
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { disconnectDB, prisma } from "../src/config/db.js";
import { pathLengthM } from "../src/utils/geo.js";

const ENV_PATH = new URL("../.env", import.meta.url);

// ---- demo values (change these freely) ----
const COMPANY_NAME = "PITCO (Demo)";
const ROUTE_NAME = "Laoag - Vigan (test)";
const BUS = {
  busNumber: "0015",
  plateNumber: "DEMO-0015",
  name: "Demo bus",
  photoUrl: null, // paste a Cloudinary URL here later
  seatCount: 40,
  deviceId: "esp32-0015",
};
const OPERATOR = { username: "operator", firstName: "Demo", lastName: "Operator" };

// Placeholder road: about 2 km, NOT a real road geometry. Points are [lng, lat] (GeoJSON order),
// ordered north to south, so "distance along the route" grows toward Vigan (southbound).
const ROUTE_POINTS = [
  [120.5936, 18.1978],
  [120.5932, 18.196],
  [120.5928, 18.1942],
  [120.5921, 18.1924],
  [120.5915, 18.1906],
  [120.5908, 18.1888],
  [120.5902, 18.187],
  [120.5895, 18.1852],
  [120.5889, 18.1834],
  [120.5883, 18.1816],
  [120.5877, 18.1798],
];

// A long random key is safe to store as a plain SHA-256 hash (bcrypt is for short, guessable passwords).
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

// Append KEY=value lines to .env, but only for keys that are not there yet. Never prints values.
function saveToEnv(entries) {
  const current = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const missing = Object.entries(entries).filter(
    ([key]) => !new RegExp(`^${key}=`, "m").test(current),
  );
  if (missing.length === 0) return [];
  const prefix = current.length > 0 && !current.endsWith("\n") ? "\n" : "";
  appendFileSync(ENV_PATH, prefix + missing.map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
  return missing.map(([key]) => key);
}

async function main() {
  const company = await prisma.company.upsert({
    where: { name: COMPANY_NAME },
    update: {},
    create: { name: COMPANY_NAME, shortName: "PITCO" },
  });

  const route = await prisma.route.upsert({
    where: { companyId_name: { companyId: company.id, name: ROUTE_NAME } },
    update: { polyline: ROUTE_POINTS, lengthM: pathLengthM(ROUTE_POINTS) },
    create: {
      companyId: company.id,
      name: ROUTE_NAME,
      polyline: ROUTE_POINTS,
      lengthM: pathLengthM(ROUTE_POINTS),
    },
  });

  const secretsToSave = {};

  // Bus: the device key is created only the first time, so re-running never invalidates it.
  let bus = await prisma.bus.findUnique({ where: { plateNumber: BUS.plateNumber } });
  if (bus) {
    bus = await prisma.bus.update({
      where: { id: bus.id },
      data: { ...BUS, companyId: company.id, routeId: route.id },
    });
  } else {
    const deviceKey = randomBytes(32).toString("hex");
    bus = await prisma.bus.create({
      data: { ...BUS, companyId: company.id, routeId: route.id, deviceKeyHash: sha256(deviceKey) },
    });
    secretsToSave.DEVICE_ID = BUS.deviceId;
    secretsToSave.DEVICE_KEY = deviceKey;
  }

  // Operator: the password is created only the first time.
  let operator = await prisma.user.findUnique({ where: { username: OPERATOR.username } });
  if (!operator) {
    const password = randomBytes(9).toString("base64url");
    operator = await prisma.user.create({
      data: {
        ...OPERATOR,
        companyId: company.id,
        role: "OPERATOR",
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    secretsToSave.SEED_OPERATOR_PASSWORD = password;
  }

  const saved = saveToEnv(secretsToSave);

  console.log("Seed done.");
  console.log(`  company : ${company.name}`);
  console.log(`  route   : ${route.name} (${route.lengthM} m, ${ROUTE_POINTS.length} points)`);
  console.log(`  bus     : ${bus.busNumber} / ${bus.plateNumber} / ${bus.deviceId}, ${bus.seatCount} seats`);
  console.log(`  user    : ${operator.username} (${operator.role})`);
  console.log(
    saved.length > 0
      ? `  new secrets saved to server/.env: ${saved.join(", ")}`
      : "  no new secrets (the bus key and operator password already exist)",
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
