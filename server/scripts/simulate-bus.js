// Pretends to be the ESP32 on bus 0015, so the API and the app can be built without hardware.
// It sends the same request the real device will (POST /device/ping with the X-Device-Key header).
//
//   npm run simulate     (the API must be running, and `npm run seed` done once)
import { disconnectDB, prisma } from "../src/config/db.js";
import { distanceM } from "../src/utils/geo.js";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const SPEED_KMH = 25;
const INTERVAL_S = 3; // seconds between pings

const { DEVICE_ID, DEVICE_KEY } = process.env;
if (!DEVICE_ID || !DEVICE_KEY) {
  console.error("DEVICE_ID and DEVICE_KEY are missing from server/.env. Run `npm run seed` first.");
  process.exit(1);
}

const bus = await prisma.bus.findUnique({
  where: { deviceId: DEVICE_ID },
  select: { busNumber: true, seatCount: true, route: { select: { polyline: true } } },
});
if (!bus) {
  console.error(`No bus has the device id "${DEVICE_ID}". Run \`npm run seed\`.`);
  process.exit(1);
}

// The road: a list of [lng, lat] points, and how far along the road each point is (in meters).
const points = bus.route.polyline;
const distanceAtPoint = [0];
for (let i = 1; i < points.length; i++) {
  distanceAtPoint.push(distanceAtPoint[i - 1] + distanceM(points[i - 1], points[i]));
}
const roadLength = distanceAtPoint[distanceAtPoint.length - 1];

// The [lng, lat] position that is `distance` meters along the road.
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

// The simulated bus.
let distance = 0; // meters from the north end (Laoag)
let heading = 1; // 1 = toward Vigan (southbound), -1 = toward Laoag (northbound)
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
  if (distance >= roadLength) {
    distance = roadLength;
    heading = -1;
  } else if (distance <= 0) {
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

  const [lng, lat] = positionAt(distance);
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
