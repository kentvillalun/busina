// Location and notification permissions. Every function returns a plain object, so pages never need
// to know the browser API: { granted, canAskAgain, supported }.
//  - canAskAgain is false once the user said no: the browser will not show the prompt again, and
//    the only way back is the site settings in the browser.
//  - Both prompts need a secure page (https, or localhost) and must start from a tap.
// Location is asked only while the app is open: the buses report their own GPS, so there is no
// background tracking.

const UNSUPPORTED = { granted: false, canAskAgain: false, supported: false };

// --- Location -------------------------------------------------------------

// Read the current permission without showing a prompt.
export const getLocationPermission = async () => {
  if (!("geolocation" in navigator)) return UNSUPPORTED;

  try {
    const { state } = await navigator.permissions.query({ name: "geolocation" });
    return { granted: state === "granted", canAskAgain: state === "prompt", supported: true };
  } catch {
    // Some browsers have no Permissions API: we cannot tell, so treat it as not asked yet.
    return { granted: false, canAskAgain: true, supported: true };
  }
};

// Browsers have no "request location" call: asking for the position is what shows the prompt.
export const askLocation = () =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(UNSUPPORTED);

    navigator.geolocation.getCurrentPosition(
      () => resolve({ granted: true, canAskAgain: true, supported: true }),
      // Denied, or allowed but no position yet: ask the browser which one it was.
      async () => resolve(await getLocationPermission()),
      { timeout: 10000, maximumAge: 600000 },
    );
  });

// The user's position as { lat, lng }, or null. It never shows a prompt: if location was not
// allowed (or the browser cannot tell), the page just works without "closest bus".
export const getCurrentPosition = async () => {
  const { granted } = await getLocationPermission();
  if (!granted) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 60000 },
    );
  });
};

// --- Notifications --------------------------------------------------------

export const getAlertsPermission = async () => {
  if (!("Notification" in window)) return UNSUPPORTED;

  const state = Notification.permission; // "default" (not asked), "granted" or "denied"
  return { granted: state === "granted", canAskAgain: state === "default", supported: true };
};

export const askAlerts = async () => {
  if (!("Notification" in window)) return UNSUPPORTED;

  await Notification.requestPermission();
  return getAlertsPermission();
};
