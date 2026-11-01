import { ALERT_BUS_KEY, ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES } from "@/hooks/useNearBusAlert";
import { urlBase64ToBytes } from "@/lib/vapidKey";

// Web Push from the browser's side: subscribe, and tell the server where this commuter waits so it can alert them
// even with the app closed. The server does the deciding (server/src/services/push.js); this only keeps its copy of the
// settings up to date. The local alert in useNearBusAlert stays as the fallback while the app is open: both use the tag
// `bus-<id>`, so the second notification replaces the first instead of stacking.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const WORKER_WAIT_MS = 5000;
export const PUSH_SYNC_EVENT = "busina:push-sync";

// Ask for a sync (PushSync listens). Called after every saved setting and after alerts are turned on.
export const requestPushSync = () => window.dispatchEvent(new Event(PUSH_SYNC_EVENT));

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

// iPhone only has this once Busina is added to the Home Screen.
export const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// `ready` never settles when no worker is registered (development), so it is raced against a timeout.
const getRegistration = () =>
  Promise.race([navigator.serviceWorker.ready, new Promise((resolve) => setTimeout(() => resolve(null), WORKER_WAIT_MS))]);

const send = (method, body) =>
  fetch("/api/push/subscribe", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// Makes the server's copy match the saved settings. Safe to call any number of times (the server upserts).
// Returns "on", "no-spot", "off" (notifications not allowed), "unsupported", "guest", "no-worker" or "failed".
export const syncPush = async () => {
  if (!pushSupported() || !PUBLIC_KEY) return "unsupported";
  if (Notification.permission !== "granted") return "off";

  try {
    const registration = await getRegistration();
    if (!registration) return "no-worker";

    const spot = read("busina:spot", null);
    let subscription = await registration.pushManager.getSubscription();

    // Nothing to time the alert to: take it off the server. The browser keeps its subscription for when a spot is set.
    if (!spot) {
      if (subscription) await send("DELETE", { endpoint: subscription.endpoint });
      return "no-spot";
    }

    subscription ??= await registration.pushManager.subscribe({
      userVisibleOnly: true, // required: every push must show a notification
      applicationServerKey: urlBase64ToBytes(PUBLIC_KEY),
    });

    const response = await send("POST", {
      ...subscription.toJSON(), // { endpoint, keys: { p256dh, auth } }
      spot: { lat: spot.lat, lng: spot.lng },
      alertMinutes: read(ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES),
      direction: read("busina:direction", "NORTHBOUND"),
      targetBusId: read(ALERT_BUS_KEY, null)?.id ?? null,
    });
    if (response.status === 401) return "guest"; // saved settings from before signing in: nothing to store
    return response.ok ? "on" : "failed";
  } catch (error) {
    console.error("[push] could not sync the subscription:", error);
    return "failed";
  }
};
