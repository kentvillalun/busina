# Busina: functional requirements

We build by requirement, one at a time, not by Figma screen. Each requirement has a check that says when it is done.
The Figma frames (AGENTS.md section 8) are the visual reference for the requirement they belong to.
`PROJECT_SPEC.md` has the reasoning behind the product; this file is the build list and the decision log.

Competition: Nov 4, 2026. Level 1 is the fallback if time runs short.

The app is a **PWA** (Next.js in `client/`, Express API in `server/`). It is meant to be installable, and later wrapped as
an Android APK with PWABuilder (TWA). Last updated Oct 30, 2026.

## Approach

Each requirement is built in three steps, so we never debug the UI and the data at the same time:

1. **Screen with mock data**, copied from the real `GET /buses` response (same shape), including the awkward states the
   simulator cannot easily produce (stale bus, full bus, empty list).
2. **Hook.** `useBuses()` polls the real API through the `/api` rewrite in `client/next.config.mjs` and returns the same
   shape as the mock.
3. **Replace the placeholder.** The screen swaps the mock for the hook.

Logic stays in the screen or controller where it is used. A helper file is created only when the same code is needed in a
second place. One requirement per branch. `client/src/app/dev-states/` shows every visual state on one page; delete it
before the demo.

## Requirements

| ID | The system must | Level | Status |
|---|---|---|---|
| FR0 | Onboarding, location permission, launch gate | | Done |
| FR1 | Accept position, speed, seats and door counts from a bus device, authenticated per device | 1 | Done |
| FR2 | List active buses with seats free, on-board count and a signal-lost flag | 1 | Done |
| FR3 | Give the app fresh bus data without a manual refresh | 1 | Done (polling every 4 s) |
| FR4 | Show the commuter the live buses for a chosen direction, closest first | 1 | Done |
| FR5 | Show a bus's 40-seat map and on-board estimate | 1 | Done (seat order still to confirm on the real device) |
| FR6 | Show a clear signal-lost state when a bus stops reporting | 1 | Done |
| FR16 | Be installable: manifest, icons, service worker, and an Android APK from PWABuilder (TWA) | 1 | Todo |
| FR17 | Run the API and the client over HTTPS, so a real phone can use location and notifications | 1 | Todo |
| FR18 | Draw the route on the map from the stored polyline (needs a public `GET /routes`) | 1 | Todo |
| FR8 | Show the ETA of a bus to the commuter's spot as a range with a safety margin | 1 | Todo |
| FR7 | Let the commuter pick a boarding spot and a travel time to it | 2 | Todo |
| FR9 | Send staged "time to leave" alerts (the headline feature, see Decisions) | 2 | Todo |
| FR10 | Let the commuter tap "I'm here, waiting" so the driver sees them | 3 | Todo |
| FR13 | Let staff sign in to one staff area: a driver with bus code and PIN, an operator with username and password | 3 | Todo |
| FR14 | Show the driver the passengers waiting ahead on the route | 3 | Todo |
| FR20 | Show the operator every bus of the company (live or signal lost, seats free) | stretch | Todo |
| FR15 | Let a commuter sign in with Google (optional, see Decisions) | optional | Not planned yet |
| FR11 | Handle location off, blocked and alerts denied gracefully | cut first | Mostly done (location banner, alerts sheet; explain re-enabling in Settings is left) |
| FR12 | Settings screen (direction, spot, travel time, permissions) | cut first | Static layout only |

Out of scope: seat reservation and any payment (see Decisions).

## Checks (how we know it is done)

- **FR1:** a valid ping returns 200; a wrong key returns 401; a bad body returns 400. Done.
- **FR2:** `GET /buses` shows the simulator bus; stop the simulator and `stale` becomes true after 30 s. Done.
- **FR3:** with the simulator running, the data changes within a few seconds with no user action; with the API stopped,
  the app shows an error state and recovers when the API returns. Done.
- **FR4:** the list shows each active bus for the selected direction; switching direction changes the list; an empty
  direction shows an empty state. The closest bus is first and buses without signal are last; this is a placeholder until
  FR8 ranks by ETA to the spot, because a bus that already passed the commuter can be the closest without "coming to" them.
- **FR5:** the seat map matches the `seats` array of the bus (checked: all 40 seats on screen equal the API array);
  on-board and standing counts match the API. The mapping from array index to seat position is an assumption (see Decisions).
- **FR6:** a bus whose `stale` is true shows "signal lost" and does not show seat data as live.
- **FR16:** Chrome offers to install it; opened from the home screen it runs without the browser bar; PWABuilder produces an
  APK that opens the deployed app. The service worker must not cache `/api` responses.
- **FR17:** a phone opens the HTTPS address, the location and notification prompts appear, `/api/buses` returns data
  through the proxy.
- **FR18:** the line follows the stored polyline and stays under the pins. The seeded route is a 2 km placeholder; real
  road geometry for Laoag to Vigan comes later and is what FR8 snaps to.
- **FR8:** the ETA is a range; it is computed from route progress and speed; a stopped bus does not divide by zero;
  a bus that has passed the spot says so.
- **FR7:** the spot and the travel time survive a restart; the travel time can be typed and overridden; the default is
  an estimate from the distance (straight line x 1.3 / 1.4 m/s).
- **FR9:** one alert per stage; no alert while the signal is lost; the alert arrives on an installed PWA or the APK over
  HTTPS (on iPhone only when added to the Home Screen). Demo with the simulator running faster than real time.
- **FR10:** the request expires after about 10 minutes; one active request per user (or device); only within about 100 m of
  the spot; rate limited.
- **FR13:** wrong PIN is rate limited; the token carries the role; commuters cannot call staff routes; a driver sees only
  their own bus.
- **FR14:** the driver sees only requests on their own route, with a vibration or sound when one is within about 500 m.
- **FR15:** nothing in FR1 to FR14 stops working without it.

## Implementation order (changed Oct 30)

1. FR16 and FR17: installable and deployed. Push, location and the APK all need HTTPS, so this comes first.
2. FR18 and FR8: the route line, then the ETA (pure functions first, tested with fixed inputs).
3. FR7: boarding spot and travel time.
4. FR9: the alert engine on the server and Web Push.
5. FR13, FR14 and FR10; then the optional FR15 and FR20.
6. FR11 and FR12 polish only if time is left.

If time runs out, cut from the bottom: FR20, then FR15, then the staff screens, then Web Push.

## Decisions

Each entry has the date and the reason, so nobody has to ask again.

- **Seat reservation is out of scope (Oct 30).** There is no way to enforce it: the seat sensors say that a seat is taken,
  not by whom, and riders get on and off along the route. Without a payment nothing keeps people from not showing up,
  which only costs the drivers; with a payment we need GCash or Maya, refunds and disputes, which means outside parties
  (the same reason SMS verification was dropped). It is a different product (ticketing) and has no bearing on the goal,
  which is less waiting by the road. The nearest thing we build is FR10, "I'm here, waiting": it reserves a stop, not a
  seat, and promises nothing. A paid reservation can be a roadmap item with an operator as partner (terminals already sell
  tickets); it is not built or demoed.
- **Commuter login is optional (Oct 30).** The core features (buses, seats, ETA, alerts) work without an account, using the
  anonymous device id from PROJECT_SPEC section 3. If it is built, it is Google sign-in: the server verifies the token and
  issues its own JWT in an httpOnly cookie, and the account is linked to the device id. What it gates (waiting requests,
  synced settings) is decided when it is built. Web Push does not need a login.
- **One staff area for drivers and operators (Oct 30).** Same screens, the role decides what is visible: a driver sees only
  their own bus and the waiting passengers ahead; an operator also sees the list of all buses of the company.
  This replaces "operator dashboard dropped" in AGENTS.md section 1.
- **"Time to leave" alerts are the headline feature (Oct 30).** The commuter sets a boarding spot and how long it takes to
  get there; Busina alerts when the optimistic ETA is at most travel time plus a buffer (`max(3 min, 20% of the ETA)`).
  Example: 15 min away from the spot means an alert when the bus is about 20 to 25 min away. Stages are in PROJECT_SPEC
  section 7. This needs FR18, FR8, FR7, FR17 and Web Push, in that order.
- **Subscription is roadmap only (Oct 30).** Idea: free live buses and seats, and a paid "Plus" with custom alert times and
  several saved spots or routes. Nothing is billed and it is not shown as working.
- **Installable through PWABuilder (Oct 30).** Advice from last year's second place team. The APK is a TWA; for the demo
  it is installed from the file, not the Play Store. Risks to test early on a real Android phone: Google sign-in inside the
  TWA, and Web Push inside the TWA.
- **Seat order (Oct 30):** the 40 seats are drawn as 10 rows of 4 numbered from the rear (`seats[0..3]` is the rear row).
  This is a guess. Confirm it against the real device and change `ROWS_OF` in `client/src/components/bus/SeatMap.jsx`
  if it is wrong. The API sends `1` for a taken seat and `0` for a free one.
- **Seat outlook (Oct 30):** the details screen only describes the seats free right now ("Plenty of seats", "Seats are
  limited", "Likely full"). The forecast in the Figma frame ("3 to 5 seats may be left") needs the ETA and a boarding rate.
- **FR3 transport:** polling `GET /buses` every 4 seconds, stopping after two failed requests in a row. WebSocket later if
  it is needed.
- **Map:** Leaflet with Geoapify "positron" tiles tinted to the app's blue; `NEXT_PUBLIC_GEOAPIFY_KEY` is public in the
  bundle and must stay out of git (restrict it to our domain in the Geoapify dashboard). The attribution is required and is
  mostly covered by the header on phones: move it to Settings under About.
- **Google Cloud billing:** a $30 prepayment was made while setting up Google Maps. Watch the bank for it; if it posts,
  close the Google Cloud billing account (or delete the project) to claim the refund.
- **Open risks:** cookies across the client host and the API host (the `/api` rewrite should keep them same-origin);
  Web Push on iPhone needs the app added to the Home Screen; the hardware and its go-signal are with the coach.

### Decisions added Oct 31

- **Competition rules (Oct 31).** The ITSO PDF does not forbid a PWA packaged as an APK. The risk is the criterion
  "Effective use of the Android platform", which names the Android SDK. We argue it through GPS, push notifications,
  vibration, install, offline and the APK. The criterion "Security" names secure user authentication, so the staff
  sign-in (FR13) must not be cut early: keep it above FR10 and the optional items. Registration needs an abstract of
  100 to 150 words, hardware and software requirements, features and screenshots as a PDF; say "PWA packaged as an
  Android APK", not React Native.
- **Each bus has its own route (Oct 31).** `Bus.routeId` already exists. The pitch uses the real Laoag to Vigan route; the
  live demo uses a short demo route in Makati, because that is where the competition is. The simulator replays along
  the route (a faster-than-real-time option is needed so an alert fires within a few minutes), because GPS indoors is
  not reliable. A walk outside with the device can be shown as a video.
- **Snap the bus to its route (Oct 31).** A pure function `snapToRoute(point, polyline)` returns the snapped lat and lng,
  `progressM` (meters along the route) and `distanceFromRouteM`. It runs on the server in `GET /buses`, so every screen and
  the alert engine agree, and it needs no schema change. `progressM` is what the ETA uses (no straight-line distance).
  Over about 100 m from the route the bus is not snapped and is marked `offRoute`, so the map never shows a bus on a road
  it is not on. Laoag to Vigan is one line without branches, so direction only means `progressM` rising (southbound) or
  falling (northbound).
- **One row per bus (Oct 31).** `BusState` is upserted on every ping; there is no history. A trip replay would need a
  separate append-only table, which is not planned.
- **Resting and stopovers (Oct 31).** Silence that the driver announced is different from silence that nobody
  announced. `Bus.status` is `RUNNING`, `ON_BREAK` or `OFF_DUTY`, with an optional `Bus.resumeAt`. The driver or conductor
  sets it on their phone in the staff area (FR13), so it works even when the ESP32 is off; it lives on `Bus`, not
  `BusState`, so a ping cannot overwrite it. The 30 second `stale` rule applies to `RUNNING` buses only.
  A bus on break stays on the map with a "Stopped" chip, its last seats framed as "as of 12 min ago" (not as live; the
  seats are usually unchanged while resting, and the next live ping replaces them), and an ETA of the remaining rest
  plus the travel time. Without `resumeAt` the ETA says "departure time not set". With a `resumeAt`, alerts still work;
  without it there is no alert. Unannounced silence stays "signal lost": no seats, no ETA.
- **Manifest screenshots come last (Oct 31).** Device-framed images from the final screens; see
  `docs/pwa-platform-notes.md` section 8.
