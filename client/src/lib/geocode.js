const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

// A short place name for a point ("Rizal St, Laoag"), or null when there is no key, no network or no name.
// Saved next to the point because the picker is the only place that is online for sure when the user taps Confirm.
export const placeName = async ({ lat, lng }) => {
  if (!GEOAPIFY_KEY) return null;
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&limit=1&apiKey=${GEOAPIFY_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return null;
    const { features } = await response.json();
    const place = features?.[0]?.properties;
    const name = [place?.street ?? place?.name ?? place?.suburb, place?.city ?? place?.county].filter(Boolean).join(", ");
    return name || null;
  } catch {
    return null;
  }
};

// What to show for a saved spot: its name, or the coordinates when it has none.
export const spotLabel = (spot) => spot.name ?? `${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)}`;
