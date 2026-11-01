"use client";

import { useEffect, useRef } from "react";
import { minutesAway } from "@/lib/nearBus";

export const ALERT_MINUTES_KEY = "busina:alertMinutes";
export const DEFAULT_ALERT_MINUTES = 10;
const WORKER_WAIT_MS = 5000;

// Android Chrome cannot create `new Notification()`; a service worker has to show it.
// `ready` never settles when no worker is registered, so it is raced against a timeout to fail loudly.
const show = async (bus, minutes) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("no service worker became ready")), WORKER_WAIT_MS),
  );
  try {
    const registration = await Promise.race([navigator.serviceWorker?.ready, timeout]);
    if (!registration) throw new Error("service workers are not supported");
    await registration.showNotification(`Bus ${bus.busNumber} is about ${minutes} min away`, {
      body: `${bus.state.seatsFree} of ${bus.seatCount} seats free now. Tap to view.`,
      icon: "/web-app-manifest-192x192.png",
      tag: `bus-${bus.id}`, // the same tag replaces a notification instead of stacking another one
      data: { url: `/bus/${bus.id}` },
    });
  } catch (error) {
    console.error("[near-bus alert] could not show the notification:", error);
  }
};

// Notifies once when a live bus gets within `alertMinutes` of the boarding spot. `buses` carry `eta` (see lib/eta.js)
// and are already limited to the commuter's saved direction (see lib/nearBus.js).
// It works while the app is open: the page decides, the service worker only shows the notification.
// shortcut: no push from the server, so nothing arrives when the app is closed; upgrade with Web Push (VAPID) if there is time.
const useNearBusAlert = (buses, alertMinutes) => {
  const notified = useRef(new Set());

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    // A bus that left the list (other direction, off the API) is never visited below, so forget it here.
    for (const id of notified.current) {
      if (!buses.some((bus) => bus.id === id)) notified.current.delete(id);
    }
    for (const bus of buses) {
      const minutes = minutesAway(bus);
      if (minutes === null || minutes > alertMinutes) {
        notified.current.delete(bus.id); // not near any more (or lost signal): it may alert again next time
        continue;
      }
      if (notified.current.has(bus.id)) continue;
      notified.current.add(bus.id);
      show(bus, Math.max(1, Math.round(minutes)));
    }
  }, [buses, alertMinutes]);
};

export default useNearBusAlert;
