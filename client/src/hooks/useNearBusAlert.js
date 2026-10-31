"use client";

import { useEffect, useRef } from "react";

export const ALERT_MINUTES_KEY = "busina:alertMinutes";
export const DEFAULT_ALERT_MINUTES = 10;

// Android Chrome cannot create `new Notification()`; a service worker has to show it.
const show = async (bus, minutes) => {
  const registration = await navigator.serviceWorker?.ready;
  if (!registration) return;
  registration.showNotification(`Bus ${bus.busNumber} is about ${minutes} min away`, {
    body: `${bus.state.seatsFree} of ${bus.seatCount} seats free now. Tap to view.`,
    icon: "/web-app-manifest-192x192.png",
    tag: `bus-${bus.id}`, // the same tag replaces a notification instead of stacking another one
    data: { url: `/bus/${bus.id}` },
  });
};

// Notifies once when a live bus gets within `alertMinutes` of the boarding spot. `buses` carry `eta` (see lib/eta.js).
// It works while the app is open: the page decides, the service worker only shows the notification.
// shortcut: no push from the server, so nothing arrives when the app is closed; upgrade with Web Push (VAPID) if there is time.
const useNearBusAlert = (buses, alertMinutes) => {
  const notified = useRef(new Set());

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    for (const bus of buses) {
      const { eta } = bus;
      const minutes = eta && !eta.passed ? (eta.minMin + eta.maxMin) / 2 : null;
      if (bus.stale || minutes === null || minutes > alertMinutes) {
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
