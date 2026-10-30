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

export { distanceM, formatDistance };
