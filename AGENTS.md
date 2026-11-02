# Busina: guide for AI coding agents

> **Current state (Nov 2, 2026):** Busina is a **PWA built with Next.js in `client/`** and an **Express API in `server/`**.
> The React Native app was archived (git tag `rn-final`) and removed. The **commuter side and the driver side are done and
> deployed**. **The operator side is next** (see section 12). Competition: **Nov 4, 2026**.

Read this file fully before changing anything. It describes the project, the stack, the patterns we already
established, and the rules to follow. `PROJECT_SPEC.md` has the long version (features, decisions, plan);
`docs/requirements.md` is the build list and decision log; `docs/web-push.md`, `docs/how-the-map-works.md`,
`docs/pwa-platform-notes.md` and `docs/makati-demo-plan.md` explain single topics.

## 1. What this is

Busina is an installable web app (PWA, later packaged as an Android APK with PWABuilder) that shows commuters where a bus
is, how many seats are free, and when to leave for the boarding spot, using live data from a bus-mounted IoT device
(ESP32 with GPS and seat/door sensors; firmware in `firmware/`). It is an entry for the UMAK ITSO 2026 "Application
Development using Android Programming" competition, **IoT category**. Judging: Innovation, Effective use of the Android
platform, Security, Functionality, User Experience (20% each).

Three audiences, three areas of one Next.js app, one API:
- **Commuters** (`/home`, `/bus/[id]`, `/settings/*`): can browse as a **guest**; signing in with **Google** is needed only
  for alerts and the boarding spot. Cookie `commuter_token`.
- **Drivers** (`/driver`, `/driver/login`): sign in with **bus code + PIN** (the driver *is* the bus; one PIN per bus). They
  see only their bus, the commuters who agreed to be seen waiting ahead, and set the bus **At rest** or **Stopover**.
  Cookie `staff_token`, role `DRIVER`, installs as its own PWA (`driver-manifest.json`).
- **Operators** (`/operator`): username + password (table `User`, role `OPERATOR`), sees the whole fleet. **Not built yet**:
  today `/operator` is only the Insights screen on simulated data (Figma S6) with no sign-in. This is the next work.

The AI assistant is dropped. **Seat reservation and payments are out of scope**. Decisions and reasons: `docs/requirements.md`
(section Decisions). Estimates (ETA) use plain kinematics (speed over the route), **no machine learning**, with a safety margin.

## 2. Who you are working with (important)

The human is a **React / Next.js developer** who wants to understand the codebase, not just accept changes. They write in
Taglish (Filipino + English); reply in the language they use.

- Before a non-trivial change: say what you will do, why, the alternatives. Wait for their go.
- After a change: say what changed, which files, how to test it, and where to look if it breaks.
- Ask before adding a package, changing config, or touching files outside the task.
- Keep explanations short for routine things and thorough for real decisions.
- Near the deadline only demo-critical fixes. Always check `git branch --show-current` before committing; never commit on `main`.

## 3. Repository layout (monorepo, one git repo)

```
busina/
├── AGENTS.md / CLAUDE.md   # this guide (CLAUDE.md just imports it)
├── PROJECT_SPEC.md         # product spec, decisions, plan, status log
├── client/                 # Next.js 16 PWA (all three areas)
│   ├── src/app/            # routes: (auth) (commuters) (driver) (operator) (intro) dev-states
│   ├── src/components/     # auth bus driver home icons layout map navigation onboarding operator pwa settings share ui
│   ├── src/hooks/  src/lib/  src/proxy.js
│   └── public/             # sw.js, offline.html, driver-manifest.json, operator-manifest.json, icons, screenshots
├── server/                 # Express 5 API (Prisma 7 + Postgres on Neon)
│   ├── prisma/             # schema.prisma, migrations/, seed.js, routes/*.json (road polylines)
│   ├── scripts/            # simulate-bus.js, set-bus-pin.js, push-test.js, fetch-route.js
│   └── src/                # config controllers middlewares routes schemas services utils
├── firmware/busina_prototype/   # ESP32 prototype (teammate's; keep INDOOR_GPS_FALLBACK = false for real runs)
├── docs/                   # requirements, web-push, how-the-map-works, pwa-platform-notes, makati-demo-plan, submission, slides
└── store-screenshots/      # App Store-style screenshots used by the manifest
```

There is **no** nested `.git`. `client/AGENTS.md` warns that this Next.js has breaking changes: read
`client/node_modules/next/dist/docs/` before writing Next code.

## 4. Tech stack

**Client (`client/`)** (JavaScript only, **no TypeScript**)
- **Next.js 16.4** (`cacheComponents`, `partialPrefetching`; App Router), React 19.3, **Tailwind CSS 4** (tokens in
  `src/app/globals.css` under `@theme`), `motion` (animation), `@heroicons/react`, `tailwind-merge`.
- Maps: `leaflet` + `react-leaflet` 5; `leaflet-rotate` turns the driver map to face the bus heading. Commuter tiles are
  Geoapify (`NEXT_PUBLIC_GEOAPIFY_KEY`); driver tiles are Esri light grey (no key). Landmarks in `src/lib/landmarks.js`.
- `jose` verifies JWTs in `src/proxy.js` (Next 16's name for middleware). `bzzz` + `ios-haptics` for vibration.
- PWA: `public/sw.js` (offline page, Web Push), manifests per area, `ServiceWorkerRegister`, `PushSync`.
- Tests: Node's runner on pure helpers, e.g. `node --test src/lib/eta.test.js`. `npm run lint` must pass.
- The browser only calls `/api/...`; `next.config.mjs` rewrites it to the Express server (`API_URL`, default
  `http://localhost:4000`), so cookies are first-party and there is no CORS.

**API (`server/`)** (JavaScript, ES modules)
- Node 22, **Express 5**, **Prisma 7** with `@prisma/adapter-pg`, Postgres on **Neon** (Singapore), `dotenv`.
- `zod` validation, `helmet`, `express-rate-limit`, `jsonwebtoken` + `bcryptjs`, `passport-google-oauth20`, `web-push`.
- Tests: `node --test src/utils/<name>.test.js` (eta, geo, direction, pickups, alertDecision, token, safeNext).
- Deploy: client on **Vercel** (`https://gobusina.vercel.app`), server on **Render** (`https://busina-fxrt.onrender.com`),
  **one Neon database shared with production (no staging)**: the local `.env` points at it, so run migrations and
  data scripts deliberately. `NEXT_PUBLIC_*` values are baked in at build time (redeploy after changing one). The same
  `JWT_SECRET` must be on Vercel and Render.

## 5. Commands

```bash
# client
cd client && npm install
npm run dev            # http://localhost:3000
npm run lint && npm run build

# api (needs server/.env: DATABASE_URL, JWT_SECRET, GOOGLE_*, VAPID keys, CORS_ORIGIN; never commit it)
cd server && npm install
npm run dev            # node --watch on :4000
npm run seed           # demo company, route, bus 0015, operator (secrets are written to .env, not printed)
npm run simulate       # fakes bus 0015 so no hardware is needed
npm run bus:pin -- 0015   # sets a driver PIN, writes DRIVER_PIN_0015 to .env
npm run push:test      # test a Web Push by hand
npm run db:migrate / db:deploy / db:studio
```

## 6. Client code conventions

- **Structure.** `src/app/` holds only routes and layouts, grouped: `(auth)` login/signup/driver login, `(commuters)`,
  `(driver)`, `(operator)`, `(intro)` onboarding. Components live in `src/components/<area>/`, hooks in `src/hooks/`,
  pure helpers in `src/lib/` (tested ones have a `.test.js` next to them).
- **Components** are `.jsx` arrow functions with `export default`; routes use `export default function XPage()`. Client
  components start with `"use client"`. Wrap anything reading cookies/search params in `Suspense` (Next 16 +
  `cacheComponents`). `react-leaflet` maps are loaded with `dynamic(..., { ssr: false })` and remount carefully.
- **Styling.** Tailwind 4 classes with the Busina tokens: `primary #1f73bd`, `navy #103b60`, `ink #0f2233`,
  `muted #4a5b6b`, `line #c9d6e2`, `stage #e7f0f8` (page bg), `success #2a7230`, `fault #b3402b`, `uncertain`.
  Fonts: `font-display` (Bricolage Grotesque ExtraBold, headings), DM Sans body. **No amber**; driver pickups use navy.
  Layouts are mobile first and become two columns from `md`. Test at 360x640 and at a desktop width.
- **Auth and routing** are in `src/proxy.js` (matcher: `/home`, `/settings/alerts`, `/settings/boarding-spot`, `/login`,
  `/driver`, `/driver/:path*`). It only checks signature, expiry and `role`; the logout blacklist is checked by the API.
  Roles are separate: a driver token is not a commuter session and the other way round. `/operator` is **not guarded yet**.
- **Data.** `useFetch`, `useBuses` (polls `/api/buses` every 4 s, stops after 2 failures), `useDriverOverview`, `useRoutes`,
  `useSession`. Settings are saved in localStorage via `useSavedSetting` (`busina:*` keys). The first-visit flag is the
  cookie `hasSeenOnboarding`.
- `src/app/dev-states/` shows visual states; **delete it before the demo**.

## 7. Existing reusable pieces (use them, do not recreate)

| Where | What |
|---|---|
| `components/layout/Page, PageContent, TopGradient` | Page frame, content width, top gradient |
| `components/navigation/BottomNav` | Commuter bottom nav (hidden on Settings sub-screens) |
| `components/home/*` | `BusCard`, `BottomSheet`, `DirectionTab`, `LiveStatus`, `TargetToggle` (My location / Boarding spot), `LocationBanner`, `AlertsSheet`, `LoadError`, skeletons |
| `components/bus/BusDetails, SeatMap` | Bus details and the 40-seat map (10 rows of 4, rear first) |
| `components/map/BusMap, DriverMap` | Commuter map (route line, buses, spot pin, landmarks) and rotating driver map |
| `components/driver/DriverDrawer, DriverSheet, MenuButton` | Driver menu (HeroIcons hamburger), bottom sheet and status switches |
| `components/auth/LoginForm, DriverLoginForm` | Google sign-in and bus code + PIN forms (model for an operator login form) |
| `components/operator/OperatorShell, LoadHeatmap, DepartureSlots` | Operator sidebar/drawer shell (only Insights is active) and the simulated Insights pieces |
| `components/share/ShareSheet`, `lib/waiting.js` | Ask before sharing "I'm waiting here" with drivers |
| `components/settings/*`, `components/ui/Toast` | Settings sub-pages, permission cards, toast |
| `components/pwa/PushSync, ServiceWorkerRegister` | Keep the server's alert settings in sync; register the worker |
| `lib/eta.js` | `etaFor`, `formatEta`, `formatSpeed`, `isOnRoad`, `roadFor` (must match `server/src/utils/eta.js`) |
| `lib/nearBus.js`, `hooks/useNearBusAlert.js` | In-page near-bus alert |
| `lib/push.js`, `lib/vapidKey.js` | Web Push subscribe/unsubscribe (see `docs/web-push.md`) |
| `lib/driverMode.js` | `driverMode(data)` -> live / rest / stopover / lost, plus the copy for each |
| `lib/session.js`, `lib/staffSession.js`, `lib/target.js`, `lib/geo.js`, `lib/geocode.js`, `lib/permissions.js`, `lib/haptics.js`, `lib/time.js` | Sessions, target choice, distance, reverse geocode, permissions, haptics, time text |
| `lib/operatorSample.js` | Simulated Insights data (KPIS, LOAD heatmap, SUGGESTIONS); replace when real data exists |

## 8. Design source (Figma) and assets

- Figma file key: `AZW4pIVAs60FO20tNjwbCJ` ("Busina - PSC Pitch Assets"), page **3 Screens**. Rows: Onboarding, Main flow,
  In-app states, **Driver** (D1 sign in, D2-D5 map in service / at rest / stopover / signal lost, D6 drawer, D7-D9 medium
  layouts) and **Operator insights** (S6, built on sample data). Ignore *Static exports* and *Dropped* (S4 Assistant, S5
  company dashboard, O1b/O2b). Phone frames are 390x844; use flex and compare against the screenshot.
- Brand rule: no amber; pickups use navy `#103b60`. Figma screenshots are cached: change `maxDimension` between calls.
- Public assets live in `client/public/` (icons, `operator/icon-*.svg`, screenshots). **Write files without a BOM**
  (Windows PowerShell `Set-Content -Encoding utf8` adds one).

## 9. API conventions (`server`)

- Layout: `src/server.js`, `src/config/` (`db.js`, `passport.js`), `src/routes/*.route.js`, `controllers/`, `schemas/`,
  `middlewares/`, `services/` (`push.js`, `routeCache.js`), `utils/` (pure, tested logic).
- Prisma client is generated to `src/generated/prisma` (git-ignored): import from
  `../generated/prisma/index.js`, never from `@prisma/client`. `postinstall` runs `prisma generate`.
- `DATABASE_URL` is the Neon connection string used at runtime; `DATABASE_URL_UNPOOLED` (optional, direct
  connection) is used by the Prisma CLI. Add `connect_timeout=15`. **Never commit `.env`**; share secrets privately.
- Process handlers: on `unhandledRejection` / `uncaughtException` log, close the server, disconnect, exit 1;
  force exit after 10 s. This is a deployed app.
- Add Prisma models **one feature at a time**, not the whole schema at once (see PROJECT_SPEC section 9 for the
  draft tables). Device endpoints authenticate with a per-device key (store only its hash); never reuse user JWTs.
- **Code shape:** `const name = async (...) => { ... };` with early returns and an `export { ... }` block at the bottom.
  **Controllers** are plain `(req, res)` functions and signal a problem with `throw new HttpError(404, "...")` (Express 5
  forwards a throw, even in async code, to the error handler, so no try/catch and no `next`). **Middlewares** take
  `(req, res, next)` and hand an error over with `return next(new HttpError(401, "..."))`; `requireRoles(allowedRoles)` takes an array.
  Keep the code simple and readable; do not over-engineer.
- **Errors:** never write `res.status(...).json({ error })` for an error. `src/utils/HttpError.js` plus
  `src/middlewares/errorHandler.js` (registered last) turn every error into `{ "error": { "code", "message", "details?" } }`,
  so the response shape is defined in one place.
- **Live bus API:** `POST /device/ping` (the ESP32; stores the latest position in `BusState`, one row per bus, upserted) and
  `GET /buses` (public; adds `seatsFree`, `onBoard`, `standing` and `stale`, true after 30 s without a ping).
  `npm run simulate` fakes bus 0015 so no hardware is needed; `npm run seed` creates the demo data.
- **Routes today:** `GET /health`; `POST /device/ping` (ESP32, device key); `GET /buses` (public; adds `seatsFree`, `onBoard`,
  `standing`, `stale`, snapped position and ETA fields; hides `AT_REST` buses, gives no ETA for a `STOPOVER` bus); `GET /routes`;
  `GET /auth/google`, `/auth/google/callback`, `POST /auth/logout`, `GET /auth/me` (commuters); `POST/DELETE /push/subscribe`,
  `POST /push/test` (commuter); `PUT/DELETE/GET /waiting` (commuter shares where they wait, 30 min, expires itself);
  `POST /staff/login`, `POST /staff/logout`, `GET /staff/me`, `GET /staff/overview` (the driver's bus, position and pickups
  ahead), `PATCH /staff/status` (IN_SERVICE / AT_REST / STOPOVER). There are **no operator routes yet**.
- **Sessions:** `authenticateCommuter` and `authenticateStaff` (`middlewares/auth.js`) read httpOnly cookies, verify the
  JWT `role`, check the `BlacklistedToken` table and reload the user/bus on every request, so disabling works at once.
  `requireRoles([...])` runs after them. A driver acts only on the bus in the token (`req.user.busId`), never an id from the URL.
  Driver login: 5 wrong PINs / 15 min per IP + bus (`staffLoginLimiter`); unknown bus, no PIN, disabled bus and wrong PIN give the same 401.
- **Models:** `Company`, `User` (operators: `passwordHash`, role OPERATOR), `Route` (+ `polylineNorthbound`), `Bus` (`pinHash`;
  `serviceStatus` lives here so a ping cannot undo it), `BusState` (one row per bus, upserted), `Commuter`, `PushSubscription`,
  `WaitingSpot`, `BlacklistedToken`. Migrations are files in `prisma/migrations`; the owner applies them to Neon.
- **Direction** is worked out on the server from movement (`utils/direction.js`) because the ESP32 sends none or a fixed one.
  **Pickups** (`utils/pickups.js`) group the commuters waiting anywhere ahead on the route, anonymously.
- **Validation:** every request body is checked with a **zod** schema in `src/schemas/`, through `validate(schema)`
  (`src/middlewares/validate.js`). Controllers receive clean data in `req.body`.
- **Middleware order on a route:** validate, then authentication (`deviceAuth` for ESP32s, `authenticate` +
  `requireRoles(...)` for people, still a stub), then the per-device or per-user rate limiter, then the controller.
  Global middlewares in `server.js`: `helmet`, `generalLimiter`, then routes, then `notFound` and `errorHandler`.
- Devices authenticate with `deviceId` (body) + `X-Device-Key` (header), compared as SHA-256 hashes in constant time.
  Unknown device and wrong key return the same 401.
- **Comments:** write one only when the code cannot say it: *why* something is done (a security reason, a hidden
  constraint, a workaround) or a unit/format that is not obvious. Do not restate what the line does, do not explain
  the framework, do not mention other projects (Ecoaid) and do not write tutorial text. Explanations for the owner
  belong in the chat reply, not in the file. A comment that would go stale when the code changes is probably wrong.
- Estimation method and safety margins: PROJECT_SPEC sections 6 and 7.

## 10. Git workflow

- One repo at the root. **Never push directly to `main`.** For each task: `git checkout main`, `git pull`,
  `git checkout -b feat/<short-name>` (or `fix/`, `chore/`), small commits, `git push -u origin <branch>`, then open
  a pull request on GitHub. The project owner reviews and merges.
- Do not edit `package.json` / `package-lock.json` without asking (they conflict easily). After a pull that changes
  `package.json`, run `npm install` and restart `npm run dev`.
- Commit messages: `feat: ...`, `fix: ...`, `chore: ...`.
- Do not use `npm audit fix --force`. Do not create nested git repos.

## 11. Do not

- Do not use TypeScript or class components. Do not add a package without asking.
- Do not run migrations or data scripts against Neon without telling the owner: the local `.env` is production.
- Do not change commuter or driver behavior while building the operator side, except where a shared helper needs it.
- Do not commit secrets, `.env` files, `node_modules`, or generated folders.
- Do not touch unrelated areas (onboarding, commuter screens, the Tailwind theme) unless the task says so.

## 12. Where things stand (Nov 2, 2026)

**Done and deployed**
- Commuter side: onboarding, Home (map, route line, bus cards, direction, My location | Boarding spot), bus details with
  seat map and speed, ETA range with safety margin, boarding spot picker, Settings (alerts, location, direction, estimates,
  privacy, terms), Google sign-in with guest mode, Web Push alerts and the in-page near-bus alert, "share where I wait"
  with drivers, installable PWA with an offline page.
- Device side: `POST /device/ping`, per-device key, route snapping, direction from movement, simulator, ESP32 firmware prototype.
- **Driver side (finished):** bus code + PIN sign-in, `/driver` map (turns to the heading, compass button, refetch on
  focus, solid blue road to the next pickup, pickups ahead), drawer menu, At rest / Stopover switches that commuters see,
  driver manifest (installs on its own).

**Next: the operator side** (only a mock exists)
1. Operator sign-in: username + password against `User` (role OPERATOR, bcrypt). Decide: reuse `staff_token` with
   `role: OPERATOR` + `companyId`, or a third cookie. Add `/operator/login`, guard `/operator` in `proxy.js`, rate limit
   like the driver login, same 401 for every failure.
2. A fleet endpoint (e.g. `GET /staff/fleet`): every bus of the operator's company with live / stale / at rest / stopover,
   seats free, position, route; scoped by `companyId` from the token, never from the URL or body.
3. Operator Overview and Buses screens (the nav entries exist in `OperatorShell` but do nothing): fleet list/map.
4. A "Reset PIN" action for a bus (today only `npm run bus:pin`).
5. Insights stays **simulated** until trip history exists (`BusState` has no history); the screen already says so.
Cut first if late: Routes/Alerts/Reports entries, real Insights.

**Open items / carry-overs**
- Delete `client/src/app/dev-states/` before the demo.
- Android Web Push is untested on a real phone; the iPhone installed PWA works.
- Makati demo route is planned for the night before (`docs/makati-demo-plan.md`); firmware must have `INDOOR_GPS_FALLBACK = false`.
- Review carry-overs the owner chose not to do yet: push endpoint host allowlist, per-user `pushLimiter`, logout ordering
  (blacklist before deleting the push row), tests for the auth middlewares, startup check for `JWT_SECRET`, Google email collision.
- Registration/submission text is in `docs/submission/`. Say "PWA packaged as an Android APK", not React Native.

## 13. AI skills and working agreements

Seven small instruction files live in `.claude/skills/<name>/SKILL.md` (sources and MIT licenses:
`.claude/skills/THIRD-PARTY-LICENSES.md`). **Claude Code** loads them automatically (the ones that say "use when..."
trigger by themselves; the others run when you type the slash command). **Any other agent**: open the file and follow
it, or just follow the short rules below, which say the same thing.

**Order of authority:** section 2 (explain things to a beginner) decides *how you communicate*. Ponytail decides *how
much code you write*. When they clash about communication, section 2 wins; when they clash about code size, Ponytail wins.

| Skill | What it does | When / how |
|---|---|---|
| `ponytail` | The smallest change that fully solves the task: reuse what exists, no abstractions, options or dependencies nobody asked for, shortcuts marked with a `shortcut:` comment. It exists to stop AI over-building | Any coding task. Levels: `/ponytail lite`, `full` (default), `ultra` |
| `ponytail-review` | Reviews a change (bugs, security, load, missing tests, code that should not exist) and lists findings in plain English. Changes no code | `/ponytail-review` before opening a pull request |
| `ponytail-audit` | The same, for the whole repo or a folder. One report, changes nothing | `/ponytail-audit` now and then, and before the demo |
| `ponytail-debt` | Lists every `shortcut:` comment as a ledger of what was deferred | `/ponytail-debt` |
| `systematic-debugging` | Find the root cause before fixing; one hypothesis at a time; stop after 3 failed fixes. Includes the known culprits in this repo | Automatically, on any bug or error |
| `verification-before-completion` | No "done / works / fixed" until you ran the check and read the real output (curl, the browser, `npm run build`, `npm run lint`, `node --test`, `prisma validate`) | Automatically, before claiming success or committing |
| `receiving-code-review` | Check review feedback against the code, ask when unclear, push back with reasons, do one item at a time, no performative agreement | Automatically, when handling pull request comments |
| `wayfinder` | For work too big or too foggy to plan at once: a markdown map of decision tickets in `docs/wayfinder/<effort>.md`, resolved one at a time. Not for normal feature slices | `/wayfinder`, only when asked |

**The rules in plain words (for agents without skills):**
- *Ponytail:* before writing, list everything the change must touch (callers, config, exports). Then take the first option that works:
  skip it if nobody needs it, reuse what the repo already has, use the standard library or a platform feature, use a
  dependency that is already installed, and only then write the minimum code. No new abstraction, wrapper, option or
  package "for later". Never cut validation at trust boundaries, error handling that prevents data loss, security, or
  anything the user asked for. New non-trivial logic gets one small check. End your reply with what you skipped or did not check.
- *Verification:* identify the command that proves the claim, run it fresh, read the output, and only then say it works.
  Words like "should work" or "looks good" before running anything are a red flag.
- *Debugging:* read the whole error, reproduce, check what changed, find the first broken link in the chain
  (app, API, middleware, Prisma, Neon), form one hypothesis, change one thing. After 3 failed fixes, ask the owner.
- *Review feedback:* understand it, verify it in the code, ask about anything unclear before changing anything.

**Deliberately not installed:** the plugins' hooks (they run scripts on your machine), Superpowers' brainstorming
server and its heavy planning/TDD/subagent skills (too much ceremony for this timeline), and Ponytail's benchmark
and help skills. Add a skill only after reading its whole `SKILL.md`, and never copy scripts into this repo without review.
