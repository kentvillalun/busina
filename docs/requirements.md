# Busina: functional requirements

We build by requirement, one at a time, not by Figma screen. Each requirement has a check that says when it is done.
The Figma frames (AGENTS.md section 8) are the visual reference for the requirement they belong to.
`PROJECT_SPEC.md` has the reasoning behind the product; this file is the build list.

Competition: Nov 4, 2026. Level 1 is the fallback if time runs short.

## Approach

Each requirement is built in three steps, so we never debug the UI and the data at the same time:

1. **Screen with mock data.** The mock is a copy of the real `GET /buses` response (same shape), written at the top of the screen file first and moved out only when a second screen needs it.
   It includes the awkward states the simulator cannot easily produce (stale bus, full bus, empty list).
2. **Custom hook.** A hook such as `useBuses()` fetches the real API (emulator: `http://10.0.2.2:4000`) and returns
   the same shape as the mock.
3. **Replace the placeholder.** The screen swaps the mock import for the hook. Nothing else in the screen changes.

Logic stays in the screen or controller where it is used. A helper file is created only when the same code is needed in a
second place. No mock toggle system. One requirement per branch.

## Requirements

| ID | The system must | Level | Status |
|---|---|---|---|
| FR1 | Accept position, speed, seats and door counts from a bus device, authenticated per device | 1 | Done |
| FR2 | List active buses with seats free, on-board count and a signal-lost flag | 1 | Done |
| FR3 | Give the app fresh bus data without a manual refresh | 1 | Todo |
| FR4 | Show the commuter the live buses for a chosen direction | 1 | Todo |
| FR5 | Show a bus's 40-seat map and on-board estimate | 1 | Todo |
| FR6 | Show a clear signal-lost state when a bus stops reporting | 1 | Todo |
| FR8 | Show the ETA of a bus to the commuter's spot as a range with a safety margin | 1 | Todo |
| FR7 | Let the commuter pick a boarding spot and a travel time to it | 2 | Todo |
| FR9 | Send staged "time to leave" alerts | 2 | Todo |
| FR10 | Let the commuter tap "I'm here, waiting" so the driver sees them | 3 | Todo |
| FR13 | Let a driver sign in with bus code and PIN | 3 | Todo |
| FR14 | Show the driver the passengers waiting ahead on the route | 3 | Todo |
| FR15 | Let a commuter sign in and reserve a seat on a bus | stretch, after Level 3 | Not planned yet |
| FR11 | Handle location off, blocked and alerts denied gracefully | cut first | Todo |
| FR12 | Settings screen (direction, spot, permissions) | cut first | Todo |
| FR0 | Onboarding, location permission, launch gate | | Done |

## Checks (how we know it is done)

- **FR1:** a valid ping returns 200; a wrong key returns 401; a bad body returns 400. Done.
- **FR2:** `GET /buses` shows the simulator bus; stop the simulator and `stale` becomes true after 30 s. Done.
- **FR3:** with the simulator running, the app's data changes within a few seconds with no user action; with the API
  stopped, the app shows an error state and recovers when the API returns; polling pauses when the app is in the background.
- **FR4:** the list shows each active bus for the selected direction with bus number, seats free and last-seen time;
  switching direction changes the list; an empty direction shows an empty state. The closest bus (straight-line distance
  from the commuter) is first and buses without signal are last; this is a placeholder until FR8 ranks by ETA to the spot,
  because a bus that already passed the commuter can be the closest without "coming to" them.
- **FR5:** the seat map matches the `seats` array of the bus; on-board and standing counts match the API.
- **FR6:** a bus whose `stale` is true shows "signal lost" and does not show seat data as live.
- **FR8:** the ETA is a range; it is computed from route progress and speed; a stopped bus does not divide by zero;
  a bus that has passed the spot says so.
- **FR7:** the spot survives an app restart; travel time can be typed and overridden.
- **FR9:** one alert per stage; no alert while the signal is lost; works on a development build, not Expo Go.
- **FR10:** the request expires after about 10 minutes; one active request per user.
- **FR13:** wrong PIN is rate limited; the token carries the role; commuters cannot call driver routes.
- **FR14:** the driver sees only requests on their own route.

## Implementation order

1. FR4 list screen with mock data, then FR3 hook and swap to real data.
2. FR5 and FR6 on the bus details screen (mock first, then the hook).
3. FR8 ETA (pure functions first, tested with fixed inputs).
4. FR7 spot picker, then FR9 alerts (needs the development build).
5. FR13 and FR14, then FR10.
6. FR11 and FR12 only if time is left.

## Open decisions

- **Commuter accounts and seat reservation (FR15):** wanted later, only if time is left after the core features.
  It would replace the current decision that commuters are anonymous (AGENTS.md section 1, PROJECT_SPEC section 3), so
  those docs and the security design (commuter login, roles, reservation rules and expiry) must be updated first.
  Not started before Levels 1 to 3 are done.

- **FR3 transport:** polling `GET /buses` every 3 to 5 seconds (proposed) or WebSocket.
- **FR4 view:** list first, map later (proposed). A map needs a map library and a development build.
- **Map provider:** OpenStreetMap through `@maplibre/maplibre-react-native` v11 with Geoapify tiles (decided; Google Maps
  was tried but its billing activation was not ready). A tutorial reports it working on Expo SDK 57. Needs a development
  build (not Expo Go) and a free Geoapify API key, which is public in the app bundle and must stay out of git. Attribution
  ("Powered by Geoapify", OpenStreetMap, OpenMapTiles) must stay visible. Fallback if it fails: a route line drawn with
  `react-native-svg`. The map is needed from FR7, not before.
- **Google Cloud billing:** a $30 prepayment was made while setting up Google Maps. Watch the bank for it; if it posts, close
  the Google Cloud billing account (or delete the project) to claim the refund.
- **Deployment:** later, when there is enough to test on a real phone.
