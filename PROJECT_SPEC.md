# Busina — Project Spec (single source of truth)

Competition: UMAK ITSO 2026, Application Development using Android Programming, **IoT category**. Date: Nov 4 (confirm).
Format: 3 students + coach, 5–10 min presentation, then Q&A. Judged by 3 IT professionals.

Judging criteria (20% each): Innovation · Effective use of Android platform · Security · Functionality · User Experience.

This is a **technical** competition, not a startup pitch. Goal: **prove it works**, live, on real hardware. Business model, subscriptions and payments are out of scope.

---

## 1. One-line pitch

Busina shows commuters where the bus is, how many seats are free, and tells them **when to leave** so they spend less time waiting on the hot roadside. Drivers see waiting passengers ahead. All estimates come from live GPS and sensors, with no machine learning.

## 2. Locked decisions

| Topic | Decision |
|---|---|
| Platform | Android app via **React Native + Expo** (verified OK with a past UMAK competitor; React Native builds a native Android app) |
| Language | **JavaScript only** (no TypeScript) |
| Apps | One mobile app: commuter screens (final Figma) plus a driver screen (not designed yet). **Operator web, the Assistant and insights are dropped** |
| Backend | **Express** (JS), REST + WebSocket |
| Database | **Postgres on Neon** (Singapore region), accessed with **Prisma 7** + `@prisma/adapter-pg` |
| API host | **Render** (same region as Neon) |
| Estimation | Rule-based kinematics, **no ML**, with built-in safety margin |
| Hardware | ESP32 + GPS + seat sensors + door counter, handled by the IoT teammate. Microcontroller choice still open |
| Build | Develop with Expo Go and a development build; ship a real **APK** |
| Out of scope | Payments, fare, subscriptions, iOS, background location for commuters |

## 3. Roles

- **Commuter** — views buses, seats, ETA; sets a waiting spot; gets "time to leave" alerts; taps "I'm here, waiting".
- **Driver / conductor** — new, suggested by the instructor. Sees passengers waiting ahead along the route.
- **Operator** — dropped from the MVP (no web dashboard). Buses, routes and devices are created by seed script or directly in the database.

**Decision: commuters are anonymous.** They only view buses and seats, so there is no login. On first launch the app generates a random device id (kept in `expo-secure-store`) and registers it with the server together with its push token; the server returns a short-lived signed token with role `commuter`. Boarding spots and alerts are tied to the device id. The driver has a real login. The server enforces roles on every protected route. A subscription or account can be added later by linking a device id to an account (free for now).

**Wow feature: "start moving" alert.** Tells the commuter when to leave for their boarding spot so they wait less on the roadside (section 6 and 7). Free for now; framed as a potential premium feature in the roadmap, not built as billing.

## 4. Screens

Design file: Figma "Busina — PSC Pitch Assets", page "3 Screens". Use only the rows "Onboarding", "Main flow" and "In-app states". Ignore "Static exports for registration PDF", "Operator insights (web)" and "Dropped / not building".

| ID | Screen | Notes |
|---|---|---|
| O1 | How Busina works | Onboarding 1 of 3, Skip, Continue |
| O2 | Location ask | "Show buses near me" / "Not now"; location only while the app is open |
| O3 | Alerts ask | "Turn on alerts & start" / "Start without alerts" |
| S1 / S1b | Map view + "Buses coming to you" sheet (collapsed and expanded) | Northbound/Southbound toggle, "You are here", Live indicator, Home and Settings tabs |
| S2 | Bus details (live) | ETA, seat outlook, 40-seat map, on-board estimate, "Notify me when it is near" |
| S3 | Bus details (stale) | Signal lost state |
| S7 | Notification: bus is near | "Bus 214 is about 2 min away. 9 of 40 seats free now. You will likely still get a seat." |
| S8 | Map, location off | Banner "Turn on location..." |
| S9 | Map, location blocked | Permission blocked state |
| S10 | Alert re-ask sheet | "Alert me when it's near" / "Not now" |
| S11 | Boarding-spot picker | Move the map to place the pin, "Confirm spot" |
| S12 | Settings | Location, Alerts, Boarding spot, Direction, optional Background alerts (off by default), How estimates work |
| D1 | **Driver screen (not designed yet)** | Waiting passengers ahead, distance, seats free, alert |

**Dropped:** S4 Assistant, S5 company dashboard, S6 operator insights, the alternate onboarding layouts (O1b, O2b), the hidden "Pay fare" button.

**Gaps between the design and the plan:** no travel-time field for the "time to leave" alert (S11/S12 only have the spot); no "I'm here, waiting" action; no driver screen; no login screens. Background alerts in S12 mention background location, but server push does not need it, so decide what that toggle really controls.

## 5. Features

1. **Live bus map** — buses on the route, updated over WebSocket, with a live indicator and a stale state when pings stop.
2. **Seat availability** — 40-seat map from seat sensors; "9 of 40 free".
3. **On-board estimate** — from the door counter, includes standing riders.
4. **ETA to my spot** — range, not a single number.
5. **Leave-now alerts** — staged push notifications (section 7).
6. **Waiting request** — "I'm here, waiting" shows a pin on the driver's screen.
7. **Driver screen** — big, glanceable, alert by vibration and sound when a passenger is within about 500 m.
8. **Onboarding and permissions** — three intro screens, then location and notification permission requests with graceful states for denied or blocked.
9. **Boarding spot and settings** — pick a spot on the map, choose direction, manage permissions.

Dropped: the Assistant, the operator overview and the insights.

## 6. Estimation method (no ML)

1. Store each route and direction as a GeoJSON polyline.
2. Snap the bus and the waiting spot to the line (`@turf/nearest-point-on-line`) to get progress in meters.
3. `remaining = spot_progress - bus_progress`. If negative, the bus has passed.
4. Speed is a moving average over the last 30–60 s of progress changes (or the GPS module's speed).
5. Guard against zero speed: use a minimum speed or blend toward the route average.
6. `ETA = remaining / speed`, recomputed on every ping.

Safety margin (errors should favor the commuter arriving early):

- Alerts use an **optimistic** ETA (speed = max(recent, route average) x 1.1–1.2).
- `buffer = max(3 min, 20% of ETA)`.
- Widen the buffer when the last ping is old or the speed is jumpy.
- Show ranges ("about 18–22 min"), keep the "Estimate" chip.
- All constants live in one config file and are tuned after real test runs.

Travel time to the spot: the user can enter it manually; otherwise estimate from the phone's foreground location (straight-line distance x 1.3 / 1.4 m/s). The user can override.

## 7. Notification stages (server push)

| Stage | When | Example copy |
|---|---|---|
| Heads up | Bus is still a while away | "Bus 214 is on its way. It may reach your spot in around 25 minutes." |
| Time to head out | optimistic ETA <= travel time + buffer | "Good time to start heading out. Bus 214 should reach your spot in about 18–22 min." |
| Bus is close | about 2–3 min | "Bus 214 is almost there. Estimates can change, so please head to your spot now." |
| Weak signal | Pings stale | "We lost Bus 214's signal for a moment, so this is a rough estimate. Heading out a little earlier is safer." |

Rules: alert once per stage, with a little hysteresis; no false alerts during signal loss; complete the watch when the bus passes; alert right away if the user is already close.

Needs FCM + a development build (Expo Go does not support remote push). **Set this up early.**

The driver sees a waiting pin only after the commuter taps "I'm here, waiting" within about 100 m of the spot. Requests expire after about 10 min, one active request per user, rate-limited.

## 8. Architecture

```
ESP32 --HTTP POST (device key)--> Express API --WebSocket--> Mobile app (commuter / driver)
                                      |                          \-> Operator web (stretch)
                                      +--> Postgres (Neon)
                                      +--> Push (Expo/FCM)
```

- The latest bus state is kept in memory and broadcast over WebSocket. Postgres is written on the side.
- History is written every 15–30 s, not on every ping (keeps Neon compute and storage low).
- The ESP32 pings every 3–5 s.
- The mobile app never connects to the database.

### Device payload (propose to the IoT teammate)

```json
{
  "deviceId": "bus-214",
  "ts": 1760000000,
  "lat": 17.5707,
  "lng": 120.3870,
  "speedKmh": 32.5,
  "seats": [0,1,1,0],
  "doorIn": 3,
  "doorOut": 1
}
```

`seats` has 40 entries (1 = taken). Sent with an `X-Device-Key` header. Agree on this shape first. If seat sensors or the door counter slip, the S2 screen needs a fallback.

## 9. Data model (draft)

- `users` — id, name, email, password_hash, role (commuter | driver | operator), plan, push_token
- `routes` — id, name, direction (northbound | southbound), polyline (GeoJSON), length_m
- `route_stops` — route_id, name, lat, lng, progress_m
- `buses` — id, code, route_id, driver_id, device_id, device_key_hash, seat_count
- `bus_state` — bus_id (PK), lat, lng, progress_m, speed_mps, seats, occupied, door_in_total, door_out_total, last_ping_at
- `bus_locations` — bus_id, lat, lng, speed, occupied, recorded_at (sampled history)
- `watches` — user_id, route_id, direction, spot_lat, spot_lng, spot_progress_m, travel_min, lead_pref, status, stage_sent
- `waiting_requests` — user_id, route_id, lat, lng, status, expires_at

Alerts (signal lost, sensor fault) are derived from `last_ping_at` and missing sensor data, not stored.

## 10. Security (20% of score)

- Passwords hashed (bcrypt or argon2); JWT with short expiry; tokens kept in `expo-secure-store`
- Role checks on the server for every route (commuter, driver, operator)
- Per-device keys for the ESP32; reject unknown or malformed payloads
- Rate limiting and validation on all inputs
- HTTPS only; secrets in env variables, never in the app or git
- Waiting-request location shared only with the driver on that route, and it expires

Be ready to explain each one in Q&A.

## 11. Tech stack

| Layer | Tools |
|---|---|
| Mobile | Expo (latest SDK), React Native, Expo Router, `expo-location`, `expo-notifications`, `expo-secure-store`, a map library (decide on day 1), WebSocket client |
| API | Node 22, Express 5, Prisma 7 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, all same version), `ws` or Socket.IO, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `helmet`, `zod`, `express-rate-limit`, `@turf/*` |
| Database | Postgres on Neon (pooled connection string) |
| Hosting | Render web service (always-on during the demo week) |
| Hardware | ESP32 + GPS module + seat sensors + door counter |
| Operator web (stretch) | Vite + React (JS) + Tailwind |
| Dev tools | Android Studio (emulator and SDK), Node, JDK 17, Claude Code |

Fallback for demo day: local Express and Postgres on a laptop, phone on a hotspot.

## 12. Folder structure

```
busina/
├── PROJECT_SPEC.md
├── README.md
└── apps/
    ├── mobile/          # Expo app (commuter + driver)
    ├── api/             # Express backend
    └── operator-web/    # empty, dropped from the MVP (can be deleted)
```

### Backend conventions (carried over from the Ecoaid backend)

- **Layout:** `src/server.js`, `src/config/`, `src/routes/*.route.js`, `src/controllers/*.controller.js`, `src/middlewares/`, `src/utils/`.
- **Prisma:** generator `prisma-client-js` with output `src/generated/prisma` (gitignored). `postinstall` runs `prisma generate`. Import the client from `../generated/prisma/index.js`, never from `@prisma/client`.
- **Neon URLs:** `DATABASE_URL` is the pooled string (host has `-pooler`) used by the running app through `PrismaPg`. `DATABASE_URL_UNPOOLED` is the direct string used only by the Prisma CLI (`prisma.config.js`). Add `connect_timeout=15` and `sslmode=require`.
- **Render deploy mistakes to avoid:** keep `@prisma/adapter-pg`, `@prisma/client` (and `prisma` if `postinstall` fails) in `dependencies`; run `npx prisma migrate deploy` in the build command so the Neon schema is never stale.
- **Ids:** `@id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`.
- **Startup:** connect to the DB in the background with retries (Neon may be asleep); `$connect()` is lazy with adapters, so verify with `SELECT 1`.
- **Process handlers:** this is a deployed app, not a throwaway demo. On `unhandledRejection` and `uncaughtException`, log, close the server, disconnect the DB and exit 1 (Render restarts it); `SIGTERM` does the same with exit 0. A 10 s timer forces the exit if connections hang. Because a restart loses in-memory bus state and drops sockets, persist `bus_state` to the DB and reload it on boot, and make the mobile app reconnect automatically.
- **Body limit:** `express.json({ limit: "100kb" })`.
- **Auth (later):** one `authenticate` + `requireRoles([...])` middleware; Bearer token for mobile (stored in `expo-secure-store`); device endpoint uses a per-device key, not a user JWT; skip per-request DB lookups on high-frequency routes.
- **Not in Ecoaid, add here:** `helmet`, `zod` input validation, `express-rate-limit` on login, device ingest and waiting requests.
- Before migrating or seeding, check which Neon branch `DATABASE_URL_UNPOOLED` points at (use separate branches for dev and the demo).

## 13. Timeline (Oct 25 to Nov 4)

| Dates | Focus |
|---|---|
| Oct 25–26 | Setup, DB schema, auth, API skeleton, bus simulator, agree on the device payload |
| Oct 27–28 | Live bus state + WebSocket, ETA logic, commuter map and bus details |
| Oct 29–30 | Leave-now alerts + push, waiting request, driver screen |
| Oct 31 | **Feature freeze.** Real ESP32 integration begins |
| Nov 1–2 | Integration testing on the real route, tune margins, build the APK |
| Nov 3 | Rehearse the demo and Q&A, deploy, warm up Neon and Render |
| Nov 4 | Competition |

Stretch work (assistant, operator web, insights) only if the must-haves are solid.

## 14. Demo plan

1. Show a live bus moving on the map (real hardware).
2. Seats and on-board count change as the sensors change.
3. Set a waiting spot and travel time, get the push alert on the phone.
4. Tap "I'm here, waiting" and show the pin on the driver screen.
5. Disconnect the bus device to show the stale state.
6. Explain the estimation, the safety margin, and the security measures.

**Demo order:** residents first (commuter, anonymous), then the driver side.
- Driver entry: Settings (S12) > "Driver or conductor? Sign in" > **bus code + PIN** (accounts are created by seed script, no public sign-up; PIN hashed, rate-limited login, JWT with role `driver`, token in `expo-secure-store`). The driver screen needs a "Sign out" to get back to commuter mode.
- Best moment: a second device taps "I'm here, waiting" and the pin appears live on the driver screen.
- Operator: no app in the MVP. Show the Figma dashboard (S5, S6) as roadmap; Prisma Studio can show buses/drivers if asked. Say clearly it is not the final operator dashboard.
- Use one emulator + one real Android phone (laptop RAM is limited).

## 15. Open questions

- Operator web dashboard: required, or stretch only? (default: stretch)
- Driver device: phone or tablet? (default: phone)
- Test route and stop coordinates: Vigan–Laoag per the design, or a shorter real route for testing?
- Microcontroller choice (IoT teammate).
- Map library: Google Maps (needs API key) or OpenStreetMap-based.
- Final competition date and presentation order.

## 16. Status (end of Oct 25)

**Done**
- `apps/mobile`: Expo SDK 57, Expo Router, NativeWind 4.2.7 (Tailwind 3, `darkMode: "class"`), JS only. Renders "Busina" in blue on web; Android emulator `Pixel_7` (Android 15, Google Play, 4 GB data partition, 2 GB RAM) boots.
- `apps/api`: Express 5, Prisma 7 + `@prisma/adapter-pg`, `GET /health`, retrying DB connect, graceful shutdown. Connected to Neon (project `busina`, Singapore). `npm run dev` (Node `--watch`), fallback `npm run dev:nodemon`.
- Prisma schema is a one-model placeholder (`Ping`). No migration has been run.
- `apps/operator-web` is an empty folder (stretch goal).

**Working method**
- Build one feature at a time: its Prisma models, then its API, then its screen. Do not write the whole schema upfront.
- Auth and staff roles are deferred until their feature.

**Known issues / gotchas**
- C: drive is nearly full (about 9 GB free). `Medium_Phone.avd` (6.1 GB) and `Pixel_7.avd` (1.2 GB, orphan) in `C:\Users\LENOVO\.android\avd` can be removed to free space.
- Files written with Windows PowerShell `Set-Content -Encoding utf8` get a BOM, which breaks NativeWind's CSS parser. Write config files without a BOM.
- Expo Go from the App Store is SDK 58 only, so an iPhone cannot open this SDK 57 project. Use the Android emulator.
- Expo account login on the CLI needs a password (set one at expo.dev/forgot-password); not needed until EAS Build.

**More gotchas learned**
- NativeWind ignores arbitrary values with decimals (`w-[161.276px]`, `px-[13.76px]`, `text-[10.32px]`): put exact Figma sizes in `style`, keep `className` for colors, fonts and whole-number sizes.
- `react-native-svg` clips to its box on Android and `overflow="visible"` does not help; use a wider canvas (`viewBox`) instead.
- Never force-kill the Android emulator (it leaves crash records that block the next start behind a crash dialog; clear `%TEMP%\AndroidEmulator`). Close it with the window or `adb emu kill`.
- AVDs live in `D:\AndroidAVD` (junction from `C:\Users\LENOVO\.android\avd`) because C: is tight.
- Onboarding scenes: `HeroIllustration` (O1), `HeroLocation` (O2), `HeroAlerts` (O3), shown inside `HeroCard` (scales to fit short screens); shared pieces in `heroParts.jsx`; `PrimaryButton`, `PulseRing` are reusable.

- **`expo-notifications` does not work in Expo Go (SDK 57):** importing it crashes with `Cannot find native module 'ExpoTopicSubscriptionModule'`. `src/lib/permissions.js` checks the native modules first (`requireOptionalNativeModule`) and returns `available: false`, so the app still runs in Expo Go. Alerts need a **development build** (`eas build --profile development` or `npx expo run:android`), which we need anyway for push (FCM). Schedule it early.
- Permissions are asked in onboarding steps 2 (location, foreground only) and 3 (notifications); the answer never blocks the flow. Read-only helpers (`getLocationPermission`, `getAlertsPermission`) and `openAppSettings` are ready for the S8 / S9 / S10 states.
- Testing permission dialogs: revoke first with `adb shell pm revoke host.exp.exponent android.permission.ACCESS_FINE_LOCATION` (and COARSE), otherwise no dialog appears.

**Status (end of Oct 27) — onboarding is done**
- Onboarding O1 to O3 is one screen driven by a `step` state (`app/onboarding/index.jsx`): scenes, animated dots, haptic buttons, Android back handling, permissions (location asked for real; notifications unavailable in Expo Go).
- Launch gate: `app/index.jsx` reads `busina:onboardingDone` from AsyncStorage (`src/lib/storage.js`) and redirects to `/home` (done) or `/onboarding` (first time). Finishing or skipping onboarding saves the flag and `router.replace("/home")`. `app/home.jsx` was a placeholder with a dev-only "Reset onboarding" button.
- Tested on the Pixel 7 emulator: first launch shows onboarding, finish goes home, relaunch goes straight home, reset shows onboarding again. Haptics and notifications are untested (need a real phone / dev build).

**Next**
1. Development build (EAS or `npx expo run:android`) so notifications and push can work; schedule early.
2. First feature slice: S1 map view with fake data, then the first Prisma models (`Route`, `Bus`) and `GET /buses`.
3. Agree the ESP32 JSON payload with the IoT teammate; choose the test route.
4. Later: driver sign-in (bus code + PIN), S8 / S9 / S10 permission states using `getLocationPermission`, `getAlertsPermission`, `openAppSettings`.

**Plan: Oct 28 to Nov 4 (competition Nov 4)**
Day counting: it is past midnight but the user's day has not ended, so the next work session still counts as Oct 27. That gives **eight working days** (Oct 27 to Nov 3) before the competition on Nov 4. Feature freeze at the end of Oct 30, Oct 31 is a buffer day, Nov 1-2 integration with the real ESP32 + APK, Nov 3 rehearsal.
- **Oct 27 (next work session) — slice 1 backend, "a bus and its live position":** agree the ESP32 JSON payload with the IoT teammate; choose the test route (a short real road) and its coordinates; Prisma models `Route`, `Bus`, `BusState` (only what this slice needs); seed script; `POST /device/ping` with a device key; `GET /buses`; a bus simulator script.
- **Oct 28 — slice 1 frontend:** S1 map view (map library, bus markers, "Buses coming to you" list) on real data from the API; S2 bus details with the seat map; start the development build (EAS builds can queue, so start it early).
- **Oct 29 — ETA + "time to leave":** route snapping and ETA with the safety margin (pure JS functions first), boarding spot picker (S11), the alert on the server; push needs the dev build + FCM.
- **Oct 30 — driver side + deploy:** driver sign-in (bus code + PIN), D1 screen with waiting passengers, "I'm here, waiting"; deploy API to Render + Neon. FEATURE FREEZE at the end of the day.
- **Oct 31 — buffer day:** catch up on anything late, dev build / APK problems, polish, backup plan.
- **Nov 1-2:** real ESP32 integration, tune margins on the real route, build and install the APK on a real phone, security pass (rate limits, device keys, validation).
- **Nov 3:** rehearse the demo and Q&A, warm up Neon and Render, backup plan (laptop + hotspot).
- **Cut first if late:** S8/S9/S10 permission states, S3 stale state polish, S12 settings, haptics tuning, Prisma Studio demo of the operator side.

**Backup plan and working modes (agreed Oct 28)**
- **Learning mode (current):** explain the plan and the decision first, wait for the user's go, explain after. Treat the user as a React Native beginner.
- **Agentic mode (backup):** I implement a whole feature end to end (model, API, screen, tests) without waiting at each step; short summary after each feature (what changed, which files, how to test, where to look when it breaks); stop and ask only for real decisions or anything risky (cost, deleting, pushing). The user commits and pushes. Keep this spec updated and write a short Q&A cheat sheet for the judges as we go.
- **Switch to agentic mode when:** (1) at the end of Oct 30 slice 1 (live bus backend) and S1 on real data are not done, or (2) a setup surprise eats the buffer (dev build, deploy, APK) through Oct 31, or (3) the user says "agentic mode".
- **Risks and fallbacks:** no hardware by Oct 30 -> plan B (driver's phone as the bus GPS, simulated seat sensors, say so honestly in the demo); entry change not allowed -> keep Busina with a reduced scope; entry change allowed and Kabutech (existing capstone, Android, hardware) is safer -> switch to Kabutech (what was learned here still applies); out of time -> agentic mode and cut level 3; health -> accept level 1 only (live bus on the map, seats, ETA).
- **Open items:** coach's date for the hardware go signal; whether the entry can be changed to Kabutech (organizers, in writing); fear of not being reimbursed for P800 each -> ask for a written agreement or for the college to buy the parts.

**(Older plan, done) onboarding O1**
- Theme tokens from the O1 design: primary `#1f73bd`, navy `#103b60`, heading text `#0f2233`, muted text `#4a5b6b`, inactive dot `#c9d6e2`, hero bg `#e7f0f8`, green `#2a7230`, button gradient `#3a8fd6` to `#165a98`. Fonts: Bricolage Grotesque ExtraBold (headings), DM Sans Regular/Medium/Bold (body).
- Steps: install `expo-font @expo-google-fonts/dm-sans @expo-google-fonts/bricolage-grotesque`; add colors and font names to `tailwind.config.js`; load fonts in `app/_layout.jsx`; build O1 (heading, paragraph, progress dots, Continue, Skip, then the hero card). Ignore the iPhone status bar in the mockup. The logo is a complex vector: export it from Figma as one asset (Figma file key `AZW4pIVAs60FO20tNjwbCJ`, node `145:236`).

**Then**
1. Run `npx expo start` in `apps/mobile`, press `a`, confirm the app shows in the emulator.
2. Pick the first feature slice (suggested: a bus and its live position, since the ETA logic builds on it) and do its model, API and screen.
3. Agree the ESP32 JSON payload with the IoT teammate (section 8).
4. Choose the test route and stop coordinates (section 15).
