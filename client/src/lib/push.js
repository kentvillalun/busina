import { ALERT_BUS_KEY, ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES } from "@/hooks/useNearBusAlert";
import { distanceM } from "@/lib/geo";
import { getCurrentPosition } from "@/lib/permissions";
import { targetMode } from "@/lib/target";
import { urlBase64ToBytes } from "@/lib/vapidKey";

// Web Push from the browser's side: subscribe, and tell the server where this commuter waits so it can alert them
// even with the app closed. The server does the deciding (server/src/services/push.js); this only keeps its copy of the
// settings up to date. The local alert in useNearBusAlert stays as the fallback while the app is open: both use the tag
// `bus-<id>`, so the second notification replaces the first instead of stacking.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const WORKER_WAIT_MS = 5000;
const MIN_MOVE_M = 30; // GPS jitter is not a move: below this, with nothing else changed, there is nothing new to tell the server
let lastSent = null; // in location mode: { key, point } of the last request
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

// True when the alert is timed to where the commuter stands (Home toggle) and not to a saved boarding spot.
export const usesLocation = () => targetMode(read("busina:target", null), read("busina:spot", null)) === "location";

// iPhone only has this once Busina is added to the Home Screen.
export const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// `ready` never settles when no worker is registered (development), so it is raced against a timeout.
const getRegistration = () =>
  Promise.race([navigator.serviceWorker.ready, new Promise((resolve) => setTimeout(() => resolve(null), WORKER_WAIT_MS))]);

const send = (method, body) =>
  fetch("/api/push/subscribe", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// "Send test notification": makes sure this phone is subscribed with the latest settings, then asks the server to push one test
// to it. Returns "sent", "unsupported", "off", "no-spot", "no-position", "guest", "expired", "slow-down" or "failed".
// "sent" means the push service accepted it, not that it has arrived: the person sees that on the phone.
export const sendTestPush = async () => {
  const synced = await syncPush();
  if (["unsupported", "off", "no-spot", "no-position", "guest"].includes(synced)) return synced;
  if (synced !== "on" && synced !== "unchanged") return "failed";

  try {
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return "failed";

    const response = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    if (response.ok) return "sent";
    if (response.status === 429) return "slow-down";
    if (response.status === 410) {
      await subscription.unsubscribe(); // the push service dropped it: the next sync makes a fresh one
      return "expired";
    }
    return "failed";
  } catch (error) {
    console.error("[push] the test notification failed:", error);
    return "failed";
  }
};

// Makes the server's copy match the saved settings. Safe to call any number of times (the server upserts).
// A closed web app cannot report its position, so in location mode the server keeps a snapshot: the position at the latest sync
// (see PushSync, which refreshes it while the app is open). Returns "on", "unchanged", "no-spot", "no-position", "off"
// (notifications not allowed), "unsupported", "guest", "no-worker" or "failed".
export const syncPush = async () => {
  if (!pushSupported() || !PUBLIC_KEY) return "unsupported";
  if (Notification.permission !== "granted") return "off";

  try {
    const registration = await getRegistration();
    if (!registration) return "no-worker";

    const spot = read("busina:spot", null);
    const viaLocation = usesLocation();
    const point = viaLocation ? await getCurrentPosition() : spot;
    if (viaLocation && !point) return "no-position"; // location is off: keep what the server has

    let subscription = await registration.pushManager.getSubscription();

    // Nothing to time the alert to: take it off the server. The browser keeps its subscription for when a spot is set.
    if (!point) {
      lastSent = null;
      if (subscription) await send("DELETE", { endpoint: subscription.endpoint });
      return "no-spot";
    }

    const settings = {
      alertMinutes: read(ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES),
      direction: read("busina:direction", "NORTHBOUND"),
      targetBusId: read(ALERT_BUS_KEY, null)?.id ?? null,
    };
    const key = JSON.stringify(settings);
    if (viaLocation && lastSent?.key === key && distanceM(lastSent.point, point) < MIN_MOVE_M) return "unchanged";

    subscription ??= await registration.pushManager.subscribe({
      userVisibleOnly: true, // required: every push must show a notification
      applicationServerKey: urlBase64ToBytes(PUBLIC_KEY),
    });

    const response = await send("POST", {
      ...subscription.toJSON(), // { endpoint, keys: { p256dh, auth } }
      spot: { lat: point.lat, lng: point.lng },
      ...settings,
    });
    if (response.status === 401) return "guest"; // saved settings from before signing in: nothing to store
    if (!response.ok) return "failed";
    lastSent = viaLocation ? { key, point: { lat: point.lat, lng: point.lng } } : null;
    return "on";
  } catch (error) {
    console.error("[push] could not sync the subscription:", error);
    return "failed";
  }
};
