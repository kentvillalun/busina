// Straight-line distance in meters between two { lat, lng } points (haversine formula).
const distanceM = (a, b) => {
  const R = 6371000; // earth radius in meters
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// "350 m" under a kilometre, "1.8 km" above.
const formatDistance = (meters) =>
  meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;

// Where a { lat, lng } point falls on a route ([lng, lat] points): its distance along the route and from it.
// Same idea as snapToRoute in server/src/utils/geo.js; the client and the server cannot share a file.
const snapToRoute = (point, polyline) => {
  // Flat x/y in meters around the point: exact enough for segments of a few hundred meters.
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos((point.lat * Math.PI) / 180);

  let best = null;
  let alongStartM = 0; // route length before the current segment
  for (let i = 1; i < polyline.length; i++) {
    const [aLng, aLat] = polyline[i - 1];
    const [bLng, bLat] = polyline[i];
    const ax = (aLng - point.lng) * mPerDegLng;
    const ay = (aLat - point.lat) * mPerDegLat;
    const dx = (bLng - aLng) * mPerDegLng;
    const dy = (bLat - aLat) * mPerDegLat;

    // How far along the segment (0 to 1) the nearest point is. The point is at (0, 0).
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, -(ax * dx + ay * dy) / lengthSq));
    const distanceFromRouteM = Math.hypot(ax + t * dx, ay + t * dy);
    const segmentM = distanceM({ lat: aLat, lng: aLng }, { lat: bLat, lng: bLng });

    if (!best || distanceFromRouteM < best.distanceFromRouteM) {
      best = { progressM: alongStartM + segmentM * t, distanceFromRouteM };
    }
    alongStartM += segmentM;
  }
  return best;
};

// The part of a route ([lng, lat] points) between two distances along it, as [lat, lng] points for the map.
const routeBetween = (polyline, fromM, toM) => {
  const [startM, endM] = fromM <= toM ? [fromM, toM] : [toM, fromM];
  const cut = (a, b, m, alongM, segmentM) => {
    const t = segmentM === 0 ? 0 : (m - alongM) / segmentM;
    return [a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t];
  };

  const points = [];
  let alongM = 0;
  for (let i = 1; i < polyline.length; i++) {
    const a = polyline[i - 1];
    const b = polyline[i];
    const segmentM = distanceM({ lat: a[1], lng: a[0] }, { lat: b[1], lng: b[0] });
    const segmentEndM = alongM + segmentM;

    if (segmentEndM >= startM && alongM <= endM) {
      if (points.length === 0) points.push(cut(a, b, Math.max(startM, alongM), alongM, segmentM));
      if (segmentEndM < endM) points.push([b[1], b[0]]);
      else points.push(cut(a, b, endM, alongM, segmentM));
    }
    alongM = segmentEndM;
  }
  return points;
};

// Compass bearing in degrees (0 = north, 90 = east, clockwise) of the way from one [lat, lng] point to another.
const bearingDeg = ([lat1, lng1], [lat2, lng2]) => {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLng = rad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(rad(lat2));
  const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

// Which way a bus on `road` ([lng, lat] points) at `progressM` is facing, as a compass bearing: the road a short way ahead of it
// (progress grows toward the end of the route, so a northbound bus looks at smaller values). null near the end of the road.
const headingAt = (road, progressM, direction) => {
  const sign = direction === "SOUTHBOUND" ? 1 : -1;
  const points = routeBetween(road, progressM, progressM + sign * 80); // always from the smaller progress to the larger
  if (points.length < 2) return null;
  return sign === 1 ? bearingDeg(points[0], points.at(-1)) : bearingDeg(points.at(-1), points[0]);
};

export { bearingDeg, distanceM, formatDistance, headingAt, routeBetween, snapToRoute };
