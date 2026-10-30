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

export { distanceM, pathLengthM };
