// Demo data for development: one company, the Laoag to Vigan route, one bus and one operator.
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
const ROUTE_NAME = "Laoag - Vigan";
const BUS = {
  busNumber: "0015",
  plateNumber: "NDA 4015",
  name: "Laoag-Vigan Express",
  photoUrl: null, // paste a Cloudinary URL here later
  seatCount: 4, // the prototype has 4 seats; must equal SEAT_COUNT in the firmware (the API refuses a ping with another number)
  deviceId: "esp32-0015",
};
const OPERATOR = { username: "operator", firstName: "Demo", lastName: "Operator" };
// `onBus` puts the person on the demo bus; the others wait for the operator to assign them.
const STAFF = [
  { firstName: "Juan", lastName: "Dela Cruz", role: "DRIVER", onBus: true },
  { firstName: "Ana", lastName: "Reyes", role: "CONDUCTOR", onBus: true },
  { firstName: "Mario", lastName: "Santos", role: "DRIVER", onBus: false },
  { firstName: "Liza", lastName: "Bautista", role: "CONDUCTOR", onBus: false },
  { firstName: "Carlo", lastName: "Mendoza", role: "DRIVER", onBus: false },
];

// The roads from the Laoag terminal to the Vigan terminal (Puregold, Vigan), from OSRM through scripts/fetch-route.js.
// Points are [lng, lat] (GeoJSON order), ordered Laoag to Vigan, so "distance along the route" grows toward Vigan.
// Buses in both directions take the Vigan City Diversion Road instead of the roads of Bantay and Vigan town, each on its
// own carriageway, so there is one line per direction. Both were made by forcing OSRM through stops on the diversion:
//   southbound (Laoag, where the diversion starts at Bantay, two stops on it, its south end, Vigan terminal):
//     node scripts/fetch-route.js out.json "120.59080,18.19606" "120.40049,17.58248" "120.39576,17.57661" "120.39439,17.56981" "120.38870,17.56006" "120.38506,17.56731"
//   northbound (Vigan terminal, south end of the diversion, its middle, where it rejoins the highway at Bantay, Laoag), then reversed:
//     node scripts/fetch-route.js out.json "120.38508,17.56731" "120.38865,17.55996" "120.39555,17.57368" "120.40057,17.58252" "120.59080,18.19606"
// shortcut: the Laoag end is the RCJ terminal on F.R. Castro St until the PITCO terminal is confirmed.
const readRoad = (file) => JSON.parse(readFileSync(new URL(`./routes/${file}`, import.meta.url), "utf8"));
const ROUTE_POINTS = readRoad("laoag-vigan.json");
const ROUTE_POINTS_NORTHBOUND = readRoad("laoag-vigan-northbound.json");

// Demo routes in Makati for the competition venue, one bus each (OSRM, scripts/fetch-route.js, same [lng, lat] order).
// The first point is the "north" end, so a southbound bus has progress growing toward the second name. The same road
// serves both directions (the carriageways are well within the 100 m off-route limit), so there is no northbound line.
// 0016 is for the real ESP32 (put esp32-0016 and DEVICE_KEY_0016 in its secrets.h); 0017 and 0018 are for `npm run simulate`.
const MAKATI_ROUTES = [
  { file: "makati-guadalupe-ayala.json", name: "Guadalupe - Ayala", busNumber: "0016", plateNumber: "NDA 4016", busName: "EDSA Carousel Demo" },
  { file: "makati-paseo-edsa.json", name: "Paseo de Roxas - EDSA", busNumber: "0017", plateNumber: "NDA 4017", busName: "Ayala Avenue Demo" },
  { file: "makati-buendia-taft.json", name: "Buendia - Taft", busNumber: "0018", plateNumber: "NDA 4018", busName: "Buendia Demo" },
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
    update: { polyline: ROUTE_POINTS, polylineNorthbound: ROUTE_POINTS_NORTHBOUND, lengthM: pathLengthM(ROUTE_POINTS) },
    create: {
      companyId: company.id,
      name: ROUTE_NAME,
      polyline: ROUTE_POINTS,
      polylineNorthbound: ROUTE_POINTS_NORTHBOUND,
      lengthM: pathLengthM(ROUTE_POINTS),
    },
  });

  const secretsToSave = {};

  // Bus: the device key is created only the first time, so re-running never invalidates it.
  let bus = await prisma.bus.findUnique({ where: { deviceId: BUS.deviceId } }); // by device, so the plate or name can change without making a second bus
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

  // Makati demo routes and their buses. Same rule as above: a bus key is created once and saved as DEVICE_KEY_<number>.
  const makatiBuses = [];
  for (const demo of MAKATI_ROUTES) {
    const points = readRoad(demo.file);
    const makatiRoute = await prisma.route.upsert({
      where: { companyId_name: { companyId: company.id, name: demo.name } },
      update: { polyline: points, lengthM: pathLengthM(points) },
      create: { companyId: company.id, name: demo.name, polyline: points, lengthM: pathLengthM(points) },
    });
    const fields = {
      busNumber: demo.busNumber,
      plateNumber: demo.plateNumber,
      name: demo.busName,
      seatCount: BUS.seatCount,
      deviceId: `esp32-${demo.busNumber}`,
    };
    let makatiBus = await prisma.bus.findUnique({ where: { deviceId: fields.deviceId } });
    if (makatiBus) {
      makatiBus = await prisma.bus.update({ where: { id: makatiBus.id }, data: { ...fields, companyId: company.id, routeId: makatiRoute.id } });
    } else {
      const deviceKey = randomBytes(32).toString("hex");
      makatiBus = await prisma.bus.create({
        data: { ...fields, companyId: company.id, routeId: makatiRoute.id, deviceKeyHash: sha256(deviceKey) },
      });
      secretsToSave[`DEVICE_ID_${demo.busNumber}`] = fields.deviceId;
      secretsToSave[`DEVICE_KEY_${demo.busNumber}`] = deviceKey;
    }
    makatiBuses.push({ route: makatiRoute, bus: makatiBus });
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

  // Staff roster: made-up people for the demo (records only, no login). Added once, matched by company and name, so
  // re-running never duplicates them and never undoes an assignment the operator changed.
  const staff = [];
  for (const { onBus, ...person } of STAFF) {
    const found = await prisma.user.findFirst({ where: { companyId: company.id, ...person } });
    staff.push(found ?? (await prisma.user.create({ data: { ...person, companyId: company.id, busId: onBus ? bus.id : null } })));
  }

  const saved = saveToEnv(secretsToSave);

  console.log("Seed done.");
  console.log(`  company : ${company.name}`);
  console.log(`  route   : ${route.name} (${route.lengthM} m, ${ROUTE_POINTS.length} points)`);
  console.log(`  bus     : ${bus.busNumber} / ${bus.plateNumber} / ${bus.deviceId}, ${bus.seatCount} seats`);
  for (const { route: makatiRoute, bus: makatiBus } of makatiBuses) {
    console.log(`  makati  : ${makatiRoute.name} (${makatiRoute.lengthM} m), bus ${makatiBus.busNumber} / ${makatiBus.deviceId}`);
  }
  console.log(`  user    : ${operator.username} (${operator.role})`);
  console.log(`  staff   : ${staff.length} drivers and conductors, ${staff.filter((person) => person.busId).length} on bus ${bus.busNumber}`);
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
