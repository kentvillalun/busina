# Web Push: the "your bus is near" alert that arrives with the app closed

Last updated Nov 2, 2026. For permissions, haptics and the Android/iPhone differences in general, see
[`pwa-platform-notes.md`](pwa-platform-notes.md). This file is only about push.

## 1. What it does, and what is proven

A commuter signs in, picks where the alert should be timed to (their **boarding spot** or **their own location**), and turns
notifications on. When a bus of their direction gets within the chosen minutes of that point, the **server** sends a push. The
phone shows it as a normal notification, with the screen locked and the app closed. Tapping it opens that bus.

Status words as in the platform notes: **works** = the owner saw it on a real phone, **expected** = known browser behavior,
not yet seen by us.

| Platform | Status |
|---|---|
| iPhone, app added to the Home Screen (iOS 16.4+) | **works** (owner tested) |
| Android Chrome, screen locked | **expected, not tested yet.** Do the test in section 7 before claiming it |
| Desktop browsers | depends on the operating system's notification settings (Windows Focus Assist and similar can hide them) |
| iPhone in a normal Safari tab | **not possible**: push needs the installed app |

## 2. How it works

Three parties take part, and the third is not ours (Apple, Google or Mozilla run the **push service**, depending on the phone):

```
 Browser + service worker            Push service (Apple / Google / Mozilla)        Our server (Express + Postgres)
 ------------------------            ---------------------------------------        -------------------------------
 1 subscribe(VAPID public key)  ---> gives an endpoint URL + keys
 2 POST /push/subscribe  -------------------------------------------------------->  stores endpoint, keys, point, minutes,
   (endpoint, keys, point, minutes,                                                  direction, chosen bus (PushSubscription)
    direction, chosen bus)
                                                                                    3 a bus pings: POST /device/ping
                                                                                    4 ETA to each stored point, decide
                                                                                    5 sendNotification (encrypted, signed
                                      <-------------------------------------------      with the VAPID private key)
 7 service worker "push" event   <---  6 delivers it, even if the app is closed
   showNotification(...)
```

- The payload is **encrypted** for the phone (aes128gcm). The push service cannot read it. The request to the push service is
  **signed with our VAPID private key**, which is how it knows the message comes from our server.
- The server decides, not the phone, because a closed web app runs no code.

| Part | File |
|---|---|
| Register the service worker (production only) | `client/src/components/pwa/ServiceWorkerRegister.jsx` |
| Subscribe and keep the server's copy up to date | `client/src/lib/push.js` (`syncPush`), `client/src/components/pwa/PushSync.jsx` |
| Show the notification, open the bus on tap | `client/public/sw.js` (`push`, `notificationclick`) |
| Store a subscription / test / remove | `server/src/routes/push.route.js`, `server/src/controllers/push.controller.js` |
| Decide and send after every ping | `server/src/services/push.js`, called from `server/src/controllers/device.controller.js` |
| The "when to alert" rules (pure, tested) | `server/src/utils/alertDecision.js` |
| ETA (port of the client formula, with a parity test) | `server/src/utils/eta.js` and `client/src/lib/eta.js` |
| Send a test push from the terminal | `npm run push:test` (`server/scripts/push-test.js`) |
| Table | `PushSubscription` in `server/prisma/schema.prisma` |

The browser calls our API through the client's own domain (`/api/*` is a rewrite in `client/next.config.mjs`), so cookies are
first-party and there is no CORS.

## 3. Who can do what

Alerts belong to an account, so the parts that exist only for alerts need a Google sign-in. Everything else is open.

| Screen | Guest | Signed in |
|---|---|---|
| Home (map, buses, ETA to your location) | yes | yes |
| Bus details (seats, speed, ETA) | yes | yes |
| Settings (location, direction, how estimates work) | yes | yes |
| "Alert me for this bus" | sends them to sign in, then back to the bus | yes |
| Settings > Alerts, Settings > Boarding spot | sign in first | yes |

`client/src/proxy.js` is the lock for the two settings pages; the "Alert me" button checks the session in the page.

## 4. What the alert is timed to

Home has a toggle, **My location | Boarding spot** (`client/src/lib/target.js`, saved as `busina:target`).

- **Boarding spot:** a point the commuter placed on the map. Nothing changes if they move.
- **My location:** for someone already on the road. "Alert me" checks they are within 100 m of the route
  (`isOnRoad`). If they are far away it says so and points to the boarding spot (**Use spot** when they have one, **Set spot**
  when they do not).

**Limit you must know:** a closed web app cannot report where the phone is. So in location mode the server keeps a
**snapshot** of the last position the app saw. The app refreshes it every 30 s while it is open and when it comes back to the
front. If the commuter walks somewhere else after closing the app, the alert is still timed to the old place. There is no expiry
(owner decision). The server only treats a new spot as a new approach when it moved more than 50 m, so GPS jitter does not
repeat alerts.

## 5. The rules for when an alert is sent

(`alertDecision.js`; the same rules as the in-app alert in `client/src/lib/nearBus.js`.)

- A bus alerts when its ETA to the point is within the chosen minutes (5, 10 or 15), **once per approach**.
- The "already alerted" list (`notifiedBusIds`) lives in the database, so a server restart does not repeat alerts. It is
  recorded **before** sending, so a slow send cannot alert twice.
- It resets when the bus gets farther than the chosen minutes, loses signal for more than 30 s, or the commuter changes the
  point, direction or chosen bus.
- If the commuter chose one bus, only that bus alerts, and when it goes past the point they get **"has passed your spot"** once
  and the choice ends. With no chosen bus, any bus going their saved direction can alert.
- Both the in-app alert and the push use the tag `bus-<id>`, so if both fire the second **replaces** the first.
- A bus whose state has **no `direction`** cannot alert **anyone**, not even a commuter who chose it: without a direction there
  is no honest ETA. The server therefore works the direction out from how the bus moves (see section 9).

## 6. Setup: keys and environment variables

**VAPID keys** identify our server to the push services. They are made once by us, not issued by Apple, Google or Firebase.
Generate a pair with `npx web-push generate-vapid-keys` (or `webpush.generateVAPIDKeys()`), and put them only in environment
variables. **Never commit them and never paste the private key anywhere.**

| Variable | Where | Value |
|---|---|---|
| `VAPID_PUBLIC_KEY` | server (`server/.env`, Render) | the public key |
| `VAPID_PRIVATE_KEY` | server only (**secret**) | the private key |
| `VAPID_SUBJECT` | server | a contact for the push service: our site URL, e.g. `https://gobusina.vercel.app` (not a personal email) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | client (`client/.env.local`, Vercel) | the **same public key**. It is public by design, so mark it **Config** (not Sensitive) on Vercel |
| `JWT_SECRET` | server **and** client (same value) | signs the session cookie; the client's `proxy.js` verifies it. A mismatch makes every login bounce back to the login page |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | server | Google sign-in; the callback must be `https://<client domain>/api/auth/google/callback` and identical in the Google console |

`NEXT_PUBLIC_*` values are **baked into the app at build time**. After adding or changing one on Vercel, **redeploy**. (This was
the cause of the first iPhone failure: the key was missing from the build, so the app silently never subscribed.)

The database needs the `PushSubscription`, `Commuter` and `BlacklistedToken` tables (migrations
`20261101120000_add_push_subscription` and `20261101130000_add_commuter_auth`, applied with `prisma migrate deploy`).

## 7. How to test it on a real phone (screen locked)

You need: the deployed app, the env vars above, one phone, and the bus simulator.

1. On the phone, open the app. **iPhone:** Share > Add to Home Screen, then open it from the icon. **Android:** open it in
   Chrome (installing is optional but closer to real use).
2. Sign in with Google.
3. **Settings > Boarding spot:** put the spot on the road the simulator drives on. (Or stay on the road and use **My location** on
   Home.)
4. **Settings > Alerts:** turn notifications on and **Allow**. Pick the minutes. Then tap **Send test notification**: it must say
   "Sent", and **"Busina test" must arrive**. If it does, the whole path (permission, subscription, keys, push service) works.
5. On the bus details page tap **Alert me for this bus** (or skip this to be alerted for any bus in your direction).
6. **Lock the phone and close the app.**
7. On a computer, in `server/`, start a bus a few km before your spot, going the way set in Settings > Direction:

   ```powershell
   $env:API_URL="https://busina-fxrt.onrender.com"; $env:START_KM="<km before the spot>"; $env:SPEED_KMH="60"; $env:DIRECTION="south"; npm run simulate
   ```

8. When the bus is within your minutes, **the notification must appear on the locked screen**. Tap it: the bus page opens.
9. Check: it arrives **once**; after the bus passes your spot, a chosen bus sends "has passed your spot".

**Android extra checks (not done yet):** repeat with battery saver on, and after the phone has been idle for a while (Doze).
Write the result here.

Tip: the Neon database is shared with production. The simulator and the test button write to it. Use your own account.

## 8. When it does not work: check one hop at a time

| Symptom | Look at |
|---|---|
| The test button says it cannot receive alerts | The app is not installed (iPhone), or `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is missing from the **build**. Redeploy after setting it |
| No row in `PushSubscription` | The same two causes; also notifications not allowed, no boarding spot or no location, or you are a guest |
| "Send test notification" says Sent but nothing arrives | OS settings (Do Not Disturb / Focus, notification permission for the installed app, battery restrictions). Run `npm run push:test` in `server/` to separate the phone from the browser |
| Test works, the bus alert does not | The point is more than 1 km from the route; the direction in Settings does not match the bus (when you chose no bus); the bus has no `direction` in its state; the ping is stale; or you already got the alert for this approach (`notifiedBusIds`) |
| Alert arrives twice | Check the tag (`bus-<id>`); two different phones/accounts; two server instances |
| Server logs `[push] send failed: 401/403` | `VAPID_*` missing or not the pair the browser subscribed with. If the keys changed, subscriptions made with the old public key stop working: turn alerts off and on |
| Server logs `404/410` | The subscription is gone (app removed, permission revoked). The row is deleted automatically |
| Login loops | `JWT_SECRET` differs between the client and server environments |

## 9. Limits

- **Delivery is not guaranteed.** The push service may delay, throttle or drop messages. We ask for `urgency: high` (wakes a
  phone in Doze) and `TTL: 300` s (a "near" alert older than 5 minutes is useless, so the push service drops it).
- **iPhone** needs iOS 16.4+ and the installed app; permission is per installed app, separate from Safari. Focus modes can
  silence it.
- **Android** may delay or restrict notifications under battery optimization. Not tested here yet.
- **No background location on the web.** See section 4: a closed app only has a snapshot.
- **The direction of a bus comes from its movement, not from the device.** The ESP32 cannot know its heading: the main
  firmware sends none and the prototype firmware branch (`feat/firmware-esp32-prototype`) sends a fixed `"NORTHBOUND"`. On every
  ping the server compares the bus's position with its last one along the road (`server/src/utils/direction.js`): forward toward
  Vigan is `SOUTHBOUND`, backward `NORTHBOUND`. It needs a real move (at least 10 m, at least 5 km/h, at most 1 km in one ping, last
  ping under 30 s old, both fixes within 100 m of the road). Otherwise it keeps the direction the bus had, and a device value only
  counts for a bus that has none yet. Checked offline on the real route over full laps: wrong only on the one ping at each turn-around.
  A bus that never moves has no direction until it does.
- **Fake positions.** The prototype firmware has `INDOOR_GPS_FALLBACK = true`: with no GPS lock it sends made-up positions along the
  Laoag road at 25 km/h and loops them. Set it to `false` for any real run, or the bus will jump to Laoag when it loses the sky and can
  alert people there.
- **One server instance assumed.** The route cache and the "already handling this bus" set are in memory
  (`shortcut:` in `services/push.js`).
- A subscription is removed on **logout** (that browser's only), on **404/410**, and when the account is deleted. It is **not**
  removed when a session simply expires; the alert keeps working until the next logout or a dead subscription.
- Everything runs on the free tiers: Render may sleep and delay the first ping after a pause.

## 10. Privacy: what is stored

| Data | Why | Who can read it |
|---|---|---|
| Google **email and name**, Google account id (`Commuter`) | Sign-in, account ownership | the database (owner/operators) |
| The **point the alert is timed to**: the boarding spot, or **the last position the app saw** in location mode (`PushSubscription.spotLat/spotLng`) | To decide when to alert | the database. In location mode this is a real location of a person, so treat it as personal data |
| Push **endpoint and encryption keys** | To reach that phone. Anyone holding them could try to send to it, so they are never logged | the database |
| Minutes, direction, chosen bus, "already alerted" list | The alert rules | the database |
| The notification text | Bus number, minutes, seats free | only the phone can decrypt it; the push service sees an encrypted blob |

- Nothing is stored for guests on the server. Their spot and direction stay in the phone's local storage.
- **Logout** removes that browser's subscription (and so its stored point) and clears the spot and chosen bus from the phone.
- Deleting a `Commuter` row deletes their subscriptions (`ON DELETE CASCADE`). There is no delete-account screen yet.
- Location mode makes the stored point move with the person; the boarding spot does not. If we keep it, say so in the privacy text
  shown to users, and consider an expiry later.
- Do not log subscription endpoints or keys. `push-test.js` prints only the push service host.

## 11. Known gaps

- The direction logic is checked offline and by unit tests, not yet with a real GPS on a real trip.
- Not tested on Android; not tested with several buses approaching at once on a real phone.
- No expiry for a location-mode point, no delete-account screen.
- Auth hardening from the review: tests for the sign-in checks, a startup check that `JWT_SECRET` is set, and a Google email
  change that collides with another account.
- The text on Settings > Alerts still says "Alerts show while the app is open." Update it after the Android test.
