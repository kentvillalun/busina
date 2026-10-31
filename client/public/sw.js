// Bump the version when what we cache changes, so activate deletes the old cache.
const CACHE = "busina-v1";
const OFFLINE_URL = "/offline.html";

// Runs once per version of this file: keep the offline page for later.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

// Runs when this version takes over: delete caches left by older versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))),
      ),
  );
  self.clients.claim();
});

// A tap on a notification opens the page it carries in `data.url`, in the open window if there is one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/home";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows[0];
      if (!open) return self.clients.openWindow(url);
      return open.navigate(url).then((client) => (client ?? open).focus());
    }),
  );
});

// Only page navigations are answered here. Everything else (/api, map tiles, scripts) is not handled,
// so it goes to the network as if there were no service worker: bus data must never come from a cache.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
