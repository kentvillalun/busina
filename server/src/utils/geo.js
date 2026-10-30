// Small geography helpers. Points are [lng, lat] (GeoJSON order, lng first), like Route.polyline.

// Distance in meters between two points (haversine formula).
const distanceM = ([lng1, lat1], [lng2, lat2]) => {
  const R = 6371000; // earth radius in meters
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// Total length in meters of a list of points.
const pathLengthM = (points) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distanceM(points[i - 1], points[i]);
  }
  return Math.round(total);
};

// The point of the route nearest to `point`, and how far along the route (from its first point) that is.
// Returns { lng, lat, progressM, distanceFromRouteM }, or null when the route has fewer than two points.
const snapToRoute = ([lng, lat], polyline) => {
  // Flat x/y in meters around the point: exact enough for segments of a few hundred meters.
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);

  let best = null;
  let alongStartM = 0; // route length before the current segment
  for (let i = 1; i < polyline.length; i++) {
    const [aLng, aLat] = polyline[i - 1];
    const [bLng, bLat] = polyline[i];
    const ax = (aLng - lng) * mPerDegLng;
    const ay = (aLat - lat) * mPerDegLat;
    const dx = (bLng - aLng) * mPerDegLng;
    const dy = (bLat - aLat) * mPerDegLat;

    // How far along the segment (0 to 1) the nearest point is. The bus is at (0, 0).
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, -(ax * dx + ay * dy) / lengthSq));
    const distanceFromRouteM = Math.hypot(ax + t * dx, ay + t * dy);
    const segmentM = distanceM(polyline[i - 1], polyline[i]);

    if (!best || distanceFromRouteM < best.distanceFromRouteM) {
      best = {
        lng: aLng + (bLng - aLng) * t,
        lat: aLat + (bLat - aLat) * t,
        progressM: alongStartM + segmentM * t,
        distanceFromRouteM,
      };
    }
    alongStartM += segmentM;
  }
  return best;
};

export { distanceM, pathLengthM, snapToRoute };
