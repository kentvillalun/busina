// Gets the road between two or more points from the public OSRM demo server and saves it as a list of
// [lng, lat] points, thinned so that a road of 80 km stays a few hundred points.
//
//   node scripts/fetch-route.js <out.json> "<lng>,<lat>" "<lng>,<lat>" ["<lng>,<lat>" ...]
//
// Stops in the middle make the route pass through them (use them to force a road, such as a diversion).
import { writeFileSync } from "node:fs";
import { pathLengthM } from "../src/utils/geo.js";

const TOLERANCE_M = 8; // a point is dropped when the road stays within this distance of the line without it

const [out, ...stops] = process.argv.slice(2);
if (!out || stops.length < 2) {
  console.error('Usage: node scripts/fetch-route.js <out.json> "<lng>,<lat>" "<lng>,<lat>" [...]');
  process.exit(1);
}

const url = `https://router.project-osrm.org/route/v1/driving/${stops.join(";")}?overview=full&geometries=geojson`;
const response = await fetch(url, { headers: { "User-Agent": "busina-dev (student project)" } });
if (!response.ok) {
  console.error(`OSRM answered ${response.status}`);
  process.exit(1);
}
const { routes } = await response.json();
if (!routes?.length) {
  console.error("OSRM found no road between those points.");
  process.exit(1);
}
const full = routes[0].geometry.coordinates;

// Douglas-Peucker: keep the points that bend the road more than TOLERANCE_M. Flat meters around the middle.
const midLat = (full[0][1] + full[full.length - 1][1]) / 2;
const mPerLng = 111320 * Math.cos((midLat * Math.PI) / 180);
const xy = full.map(([lng, lat]) => [lng * mPerLng, lat * 111320]);
const keep = new Array(full.length).fill(false);
keep[0] = keep[full.length - 1] = true;
const pending = [[0, full.length - 1]];
while (pending.length > 0) {
  const [from, to] = pending.pop();
  const [ax, ay] = xy[from];
  const [bx, by] = xy[to];
  const length = Math.hypot(bx - ax, by - ay) || 1;
  let farthest = -1;
  let farthestM = TOLERANCE_M;
  for (let i = from + 1; i < to; i++) {
    const distance = Math.abs((bx - ax) * (ay - xy[i][1]) - (ax - xy[i][0]) * (by - ay)) / length;
    if (distance > farthestM) [farthest, farthestM] = [i, distance];
  }
  if (farthest !== -1) {
    keep[farthest] = true;
    pending.push([from, farthest], [farthest, to]);
  }
}
const points = full.filter((_, i) => keep[i]).map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))]);

writeFileSync(out, JSON.stringify(points));
console.log(`${out}: ${full.length} points from OSRM -> ${points.length} kept, ${pathLengthM(points)} m`);
