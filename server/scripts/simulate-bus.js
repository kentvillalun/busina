// Pretends to be the ESP32 on bus 0015, so the API and the app can be built without hardware.
// It sends the same request the real device will (POST /device/ping with the X-Device-Key header).
//
//   npm run simulate     (the API must be running, and `npm run seed` done once)
//
// Options (environment variables):
//   API_URL      where to send the pings: http://localhost:4000 (default) or the deployed API
//   SPEED_KMH    default 25; up to 200, which the API accepts
//   START_KM     how far from Laoag the bus starts, in km (default 0)
//   DIRECTION    "south" (toward Vigan, default) or "north" (toward Laoag)
// For a demo: set a boarding spot in the app, then start the bus a few km before it, e.g. with PowerShell
//   $env:API_URL="https://busina-fxrt.onrender.com"; $env:START_KM="20"; $env:SPEED_KMH="90"; npm run simulate
import { disconnectDB, prisma } from "../src/config/db.js";
import { distanceM } from "../src/utils/geo.js";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const SPEED_KMH = Number(process.env.SPEED_KMH ?? 25); // SPEED_KMH=300 npm run simulate to cross 82 km in minutes
const INTERVAL_S = 3; // seconds between pings

const { DEVICE_ID, DEVICE_KEY } = process.env;
if (!DEVICE_ID || !DEVICE_KEY) {
  console.error("DEVICE_ID and DEVICE_KEY are missing from server/.env. Run `npm run seed` first.");
  process.exit(1);
}

const bus = await prisma.bus.findUnique({
  where: { deviceId: DEVICE_ID },
  select: {
    busNumber: true,
    seatCount: true,
    route: { select: { polyline: true, polylineNorthbound: true } },
  },
});
if (!bus) {
  console.error(`No bus has the device id "${DEVICE_ID}". Run \`npm run seed\`.`);
  process.exit(1);
}

// A road: a list of [lng, lat] points, how far along the road each point is (in meters), and a way to find
// the position that is `distance` meters along it.
const buildRoad = (points) => {
  const distanceAtPoint = [0];
  for (let i = 1; i < points.length; i++) {
    distanceAtPoint.push(distanceAtPoint[i - 1] + distanceM(points[i - 1], points[i]));
  }
  const length = distanceAtPoint[distanceAtPoint.length - 1];

  const positionAt = (distance) => {
    for (let i = 1; i < points.length; i++) {
      if (distance <= distanceAtPoint[i]) {
        const share = (distance - distanceAtPoint[i - 1]) / (distanceAtPoint[i] - distanceAtPoint[i - 1]);
        return [
          points[i - 1][0] + (points[i][0] - points[i - 1][0]) * share,
          points[i - 1][1] + (points[i][1] - points[i - 1][1]) * share,
        ];
      }
    }
    return points[points.length - 1];
  };
  return { length, positionAt };
};
// Northbound buses may take another road (the diversion); both roads run from Laoag to Vigan.
const southRoad = buildRoad(bus.route.polyline);
const northRoad = buildRoad(bus.route.polylineNorthbound ?? bus.route.polyline);

// The simulated bus.
let heading = process.env.DIRECTION === "north" ? -1 : 1; // 1 = toward Vigan (southbound), -1 = toward Laoag (northbound)
let road = heading === 1 ? southRoad : northRoad;
let distance = Math.min(Math.max(Number(process.env.START_KM ?? 0) * 1000, 0), road.length); // meters from the north end (Laoag), along the current road
const seats = Array.from({ length: bus.seatCount }, () => (Math.random() < 0.3 ? 1 : 0));
let doorIn = seats.filter(Boolean).length; // people already on board came through the door
let doorOut = 0;

process.on("SIGINT", async () => {
  console.log("\nSimulator stopped.");
  await disconnectDB();
  process.exit(0);
});

console.log(`Simulating bus ${bus.busNumber}: ${SPEED_KMH} km/h, a ping every ${INTERVAL_S} s -> ${API_URL}. Ctrl+C to stop.`);

while (true) {
  // Move along the road, and turn around at each end.
  distance += heading * (SPEED_KMH / 3.6) * INTERVAL_S;
  if (distance >= road.length) {
    road = northRoad;
    distance = road.length;
    heading = -1;
  } else if (distance <= 0) {
    road = southRoad;
    distance = 0;
    heading = 1;
  }

  // Sometimes a passenger takes or leaves a seat, and the door counter follows.
  if (Math.random() < 0.35) {
    const seat = Math.floor(Math.random() * seats.length);
    seats[seat] = seats[seat] ? 0 : 1;
    if (seats[seat]) doorIn += 1;
    else doorOut += 1;
  }

  const [lng, lat] = road.positionAt(distance);
  const body = {
    deviceId: DEVICE_ID,
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    speedKmh: SPEED_KMH,
    direction: heading === 1 ? "SOUTHBOUND" : "NORTHBOUND",
    seats,
    doorIn,
    doorOut,
  };

  try {
    const response = await fetch(`${API_URL}/device/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Device-Key": DEVICE_KEY },
      body: JSON.stringify(body),
    });
    console.log(
      `${body.direction.toLowerCase()} ${Math.round(distance)} m, seats ${seats.filter(Boolean).length}/${seats.length}` +
        ` -> ${response.status}${response.ok ? "" : " " + (await response.text())}`,
    );
  } catch (error) {
    console.error(`Could not reach ${API_URL}: ${error.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, INTERVAL_S * 1000));
}
