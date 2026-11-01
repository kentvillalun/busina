import webpush from "web-push";
import { prisma } from "../config/db.js";
import { decideAlert } from "../utils/alertDecision.js";
import { busOnRoad, etaFor } from "../utils/eta.js";

// Web Push for the "bus is near your boarding spot" alert. It runs after a ping is saved, never inside the ping's response.
// shortcut: the route and the "already handling this bus" set live in this process's memory; with more than one server
// instance, move both to the database.

let ready; // undefined until the first use, then true/false
const setup = () => {
  if (ready !== undefined) return ready;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  ready = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT);
  if (ready) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  else console.warn("[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT are empty: push is off");
  return ready;
};

// Sends one notification. A subscription the push service says is gone (404/410: the app was uninstalled or the
// permission revoked) is deleted, so it is not tried again. Returns "sent", "gone", "failed" or "off".
const sendPush = async (subscription, payload) => {
  if (!setup()) return "off";
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
      { urgency: "high", TTL: 300 }, // "high" wakes a phone in Doze; after 5 minutes an unread "near" alert is useless
    );
    return "sent";
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      await prisma.pushSubscription.deleteMany({ where: { id: subscription.id } });
      return "gone";
    }
    console.error("[push] send failed:", error.statusCode ?? error.message);
    return "failed";
  }
};

// A route changes only when someone edits it, so a few minutes in memory saves a read of two long polylines on every ping.
const ROUTE_CACHE_MS = 10 * 60_000;
const routes = new Map(); // routeId -> { route, loadedAt }
const getRoute = async (routeId) => {
  const cached = routes.get(routeId);
  if (cached && Date.now() - cached.loadedAt < ROUTE_CACHE_MS) return cached.route;
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    select: { polyline: true, polylineNorthbound: true },
  });
  routes.set(routeId, { route, loadedAt: Date.now() });
  return route;
};

// Same words as the notifications the app shows itself (hooks/useNearBusAlert.js), so both read alike.
const payloadFor = (kind, bus, state, minutes) => ({
  ...(kind === "passed"
    ? {
        title: `Bus ${bus.busNumber} has passed your spot`,
        body: "This alert is over. Pick another bus to be alerted again.",
      }
    : {
        title: `Bus ${bus.busNumber} is about ${Math.max(1, Math.round(minutes))} min away`,
        body: `${bus.seatCount - state.occupied} of ${bus.seatCount} seats free now. Tap to view.`,
      }),
  tag: `bus-${bus.id}`, // the same tag replaces a notification instead of stacking another one
  data: { url: `/bus/${bus.id}` },
});

const handling = new Set(); // bus ids whose last ping is still being processed

// `bus` is { id, busNumber, seatCount, routeId }, `state` the BusState row just saved, `signalReturned` is true when this ping
// follows a silence longer than the stale limit. Decides for every subscription this bus matters to.
const notifyBusPing = async ({ bus, state, signalReturned }) => {
  if (!setup()) return;
  if (handling.has(bus.id)) return; // pings come every few seconds; the next one catches up, and nothing is sent twice
  handling.add(bus.id);

  try {
    // A commuter who chose this bus, or one who chose none and watches this bus's direction.
    // A bus with no direction has no ETA (etaFor returns null), so it alerts nobody; see docs/web-push.md.
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        OR: [
          { targetBusId: bus.id },
          ...(state.direction ? [{ targetBusId: null, direction: state.direction }] : []),
        ],
      },
    });
    if (subscriptions.length === 0) return;

    const route = await getRoute(bus.routeId);
    if (!route) return;
    const { progressM, offRoute, speedKmh } = busOnRoad(state, route);
    const asSeenByApp = { stale: false, state: { progressM, direction: state.direction, speedKmh, offRoute } };

    for (const subscription of subscriptions) {
      try {
        const notified = Array.isArray(subscription.notifiedBusIds) ? subscription.notifiedBusIds : [];
        const result = decideAlert({
          notified,
          busId: bus.id,
          eta: etaFor(asSeenByApp, route, { lat: subscription.spotLat, lng: subscription.spotLng }),
          alertMinutes: subscription.alertMinutes,
          isTarget: subscription.targetBusId === bus.id,
          signalReturned,
        });

        // Recorded before sending: if the send is slow or fails, the commuter is not alerted twice for one approach.
        if (result.clearTarget || JSON.stringify(result.notified) !== JSON.stringify(notified)) {
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { notifiedBusIds: result.notified, ...(result.clearTarget && { targetBusId: null }) },
          });
        }
        if (result.send) await sendPush(subscription, payloadFor(result.send, bus, state, result.minutes));
      } catch (error) {
        console.error("[push] subscription skipped:", error.message); // one bad row must not stop the others
      }
    }
  } finally {
    handling.delete(bus.id);
  }
};

export { notifyBusPing, sendPush };
