# Busina: guide for AI coding agents

Read this file fully before changing anything. It describes the project, the stack, the patterns we already
established, and the rules to follow. `PROJECT_SPEC.md` has the long version (features, decisions, plan).

## 1. What this is

Busina is an Android app (React Native + Expo) that shows commuters where a bus is, how many seats are free, and
when to leave for the boarding spot, using live data from a bus-mounted IoT device (ESP32 with GPS and sensors).
It is an entry for the UMAK ITSO 2026 "Application Development using Android Programming" competition,
**IoT category**. The competition is on **Nov 4, 2026**. Judging: Innovation, Effective use of the Android
platform, Security, Functionality, User Experience (20% each).

- Commuters are **anonymous** (no login). Drivers sign in later with **bus code + PIN**.
- The operator web dashboard, the AI assistant and the insights page are **dropped** from the MVP.
- Estimates (ETA) use plain kinematics (speed over the route), **no machine learning**, with a safety margin.

## 2. Who you are working with (important)

The human is a **React / Next.js developer who is new to React Native** and wants to understand the codebase,
not just accept changes. They write in Taglish (Filipino + English); reply in the language they use.

- Before a non-trivial change: say what you will do, why, the alternatives, and how it differs from React/Next.js.
  Wait for their go.
- After a change: say what changed, which files, how to test it, and where to look if it breaks.
- Ask before adding a package, changing config, or touching files outside the task.
- Keep explanations short for routine things and thorough for real decisions.

## 3. Repository layout (monorepo, one git repo)

```
busina/
├── AGENTS.md            # this file
├── PROJECT_SPEC.md      # full spec, decisions, plan, status
├── apps/
│   ├── mobile/          # Expo app (the Android app)
│   ├── api/             # Express API (Prisma + Postgres on Neon)
│   └── operator-web/    # empty, dropped from the MVP
```

There is **no** `.git` inside `apps/*`. If a generator (`create-expo-app`, `npm create vite`) creates one, delete it.

## 4. Tech stack

**Mobile (`apps/mobile`)** (JavaScript only, **no TypeScript**)
- Expo SDK **57** (`expo ~57.0`), React 19.2, React Native 0.86, **Expo Router** (file-based routing, `app/` folder)
- **NativeWind 4.2.7** with **Tailwind CSS 3** (`className` on React Native components), `darkMode: "class"`
- `react-native-reanimated` 4 + `react-native-worklets` (animations), `react-native-svg` (SVG as components)
- `expo-font` + `@expo-google-fonts/dm-sans` + `@expo-google-fonts/bricolage-grotesque`
- `expo-linear-gradient`, `expo-haptics`, `expo-location` (foreground only), `expo-notifications`
- `@react-native-async-storage/async-storage` (local storage)
- Tested on an Android emulator (Pixel 7, Android 15, Google Play image). Expo Go is SDK 57; the Play Store
  version of Expo Go may be newer and will not open this project.

**API (`apps/api`)** (JavaScript, ES modules)
- Node 22, **Express 5**, **Prisma 7** with `@prisma/adapter-pg`, Postgres on **Neon** (Singapore), `dotenv`
- Dev: `node --watch` (`npm run dev`); fallback `npm run dev:nodemon`
- Planned: WebSocket (`ws`), `zod` validation, `helmet`, `express-rate-limit`, JWT + `bcryptjs`, `@turf/*`
- Deploy target: Render (same region as Neon)

## 5. Commands

```bash
# mobile
cd apps/mobile
npm install
npx expo start --clear        # then press "a" for the Android emulator
npx expo install <package>    # ALWAYS use this to add packages (never plain npm install <pkg>)

# api (needs apps/api/.env, see section 9)
cd apps/api
npm install
npm run dev
```

After installing any package, **restart Metro with `--clear`**. Metro caches its file list and will report
"cannot find module" for new packages otherwise.

## 6. Mobile code conventions

**Structure**
- `app/`: **only screens and layouts** (every file there becomes a route). Files starting with `_` or `+` are
  special (`_layout.jsx`). Route groups use parentheses, e.g. `(tabs)`.
- `src/components/`: reusable components. `src/components/svg/`: SVGs converted to components (generated, see 8).
- `src/lib/`: non-UI helpers (`storage.js`, `permissions.js`). Keep Expo API calls behind these helpers.
- No TypeScript. Every file with JSX is `.jsx`: components in `src/components/` (`PascalCase.jsx`) and screens and
  layouts in `app/`. **Components** are arrow functions (`const Card = ({ title }) => { ... };`) with
  `export default Card;` at the bottom. **Screens** in `app/` are plain `export default function HomeScreen()`.
  A small component used by only one screen may live in that screen file until a second screen needs it.
  Helpers in `src/lib/` have no JSX, so they stay `camelCase.js`.

**Navigation**
- Expo Router. `app/index.jsx` is the launch gate: it reads the `busina:onboardingDone` flag from AsyncStorage and
  redirects to `/home` or `/onboarding`. Use `router.replace()` (not `push`) when leaving a flow for good.
- Onboarding is **one screen driven by a `step` state** (`app/onboarding/index.jsx`), not three routes.
- The main screens live in the `(tabs)` group (the name is not part of the URL): `app/(tabs)/_layout.jsx` is a headless
  `Tabs` layout from `expo-router/ui` that draws the floating pill nav, with `home.jsx` (`/home`) and `settings.jsx`
  (`/settings`). `TabList` must be a direct child of `Tabs`, and the `TabTrigger`s direct children of what `TabList` renders.

**Styling (NativeWind)**
- Use `className` for layout and tokens. Theme colors/fonts are in `tailwind.config.js`:
  - Colors: `primary #1f73bd`, `navy #103b60`, `ink #0f2233`, `muted #4a5b6b`, `line #c9d6e2`,
    `stage #e7f0f8`, `success #2a7230`. Button gradient `#3a8fd6` to `#165a98`.
  - Fonts: `font-display` (Bricolage Grotesque ExtraBold, headings), `font-sans` (DM Sans regular),
    `font-sans-medium`, `font-sans-bold`. **Weights are separate families**; `font-bold` does not switch weight.
- **NativeWind ignores arbitrary values that contain decimals** (`w-[161.276px]`, `px-[13.76px]`,
  `text-[10.32px]`). Put exact Figma numbers in the `style` prop; keep `className` for colors, fonts and
  whole-number sizes.
- `LinearGradient` and Reanimated animated styles take `style`, not `className`.
- Android text: set `style={{ includeFontPadding: false }}` on `Text` to match Figma line heights.
- Shadows on Android come from `elevation`; use the shared `shadow` object in `src/components/heroParts.jsx`.

**React Native rules (differences from web)**
- No HTML. Use `View`, `Text`, `Pressable`, `Image`, `FlatList`, `ScrollView`.
- **All text must be inside `<Text>`**; a raw string inside `View` or `Pressable` crashes. Beware `{0 && <X/>}`.
- Layout is flexbox only (default direction is column). No CSS grid, no media queries, no cascade; text styles do
  not inherit from a parent `View`.
- Use `SafeAreaView` from `react-native-safe-area-context` (not the one from `react-native`).
- `react-native-svg` clips to its box on Android; `overflow="visible"` does not help. Use a bigger canvas/viewBox.
- Do not hardcode widths for whole screens. Use `flex`, and let content shrink (see `HeroCard`) so the layout fits
  a short phone (360x640 dp) as well as a Pixel 7. Test both.

**Permissions and notifications**
- Ask for **foreground** location only (buses report their own GPS; no background location).
- `expo-notifications` does **not** work in Expo Go (missing native module). `src/lib/permissions.js` checks for
  the native modules first and returns `available: false`. Do not import `expo-notifications` at the top of a file.
  Real alerts need a development build.
- To retest a permission dialog: `adb shell pm revoke host.exp.exponent android.permission.ACCESS_FINE_LOCATION`.

## 7. Existing reusable pieces (use them, do not recreate)

| File | What it is |
|---|---|
| `src/components/PrimaryButton.jsx` | Gradient main button, light haptic on press. `<PrimaryButton title onPress disabled />` |
| `src/components/TextButton.jsx` | Quiet text action ("Not now", "Skip"), selection haptic. `bold={false}` for medium weight |
| `src/components/ProgressDots.jsx` | Animated step dots. `<ProgressDots step total />` |
| `src/components/StepTransition.jsx` | Fade/slide-in when `stepKey` changes. `kind="fade"` or default slide |
| `src/components/PulseRing.jsx` | Looping ripple animation (Reanimated) |
| `src/components/BottomNavItem.jsx` | One button of the floating bottom nav: solid icon and label when active, outline icon when not. Used by `app/(tabs)/_layout.jsx` |
| `src/components/HeroCard.jsx` | Card that shrinks to the space it is given and scales its scene to fit |
| `src/components/HeroIllustration.jsx`, `HeroLocation.jsx`, `HeroAlerts.jsx`, `heroParts.jsx` | Onboarding scenes (O1, O2, O3) and shared pieces (`RoadBase`, `BusMarker`, `YouDot`, `Halo`, `shadow`) |
| `src/components/svg/*` | `Logo`, `AppIcon`, `HeroBg`, `RoadBg`, and the nav icons `IconHomeSolid`, `IconHomeOutline`, `IconSettingsSolid`, `IconSettingsOutline` (generated from `assets/images/*.svg`; colored with the `color` prop) |
| `src/lib/storage.js` | AsyncStorage wrapper (`getOnboardingDone`, `setOnboardingDone`, `resetOnboarding`) |
| `src/lib/permissions.js` | `askLocation`, `askAlerts`, `getLocationPermission`, `getAlertsPermission`, `openAppSettings` |

## 8. Design source (Figma) and assets

- Figma file key: `AZW4pIVAs60FO20tNjwbCJ` ("Busina - PSC Pitch Assets"), page **3 Screens**. Use only the rows
  *Onboarding*, *Main flow* and *In-app states*; ignore *Static exports*, *Operator insights* and *Dropped*.
- Node ids: O1 `143:164`, O2 `143:213`, O3 `149:334`, S1 `50:2`, S1b `67:38`, S2 `48:72`, S3 `48:183`,
  S7 `130:110`, S8 `146:236`, S9 `146:352`, S10 `147:272`, S11 `147:522`, S12 `147:415`.
- Dropped (do not build): S4 Assistant, S5 company dashboard, S6 operator insights, O1b/O2b.
- Frames are 390x844. Do not copy absolute positions blindly; use flex and compare against the Figma screenshot.
- SVG assets: put the `.svg` in `apps/mobile/assets/images/`, then
  `npx @svgr/cli --native --out-dir src/components/svg -- assets/images` to generate the component, then rename the
  generated component files to `.jsx` and delete the generated `index.js` (we import each icon directly).
  Remove stray background rectangles that Figma exports with the node.
- **Write files without a BOM.** On Windows PowerShell, `Set-Content -Encoding utf8` adds a BOM that breaks
  NativeWind's CSS parser. VS Code's default UTF-8 is fine.

## 9. API conventions (`apps/api`)

- Layout: `src/server.js`, `src/config/` (`db.js`, later `env.js`), `src/routes/*.route.js`,
  later `controllers/`, `middlewares/`, `services/`, `utils/`.
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
  `package.json`, run `npm install` and restart Metro with `--clear`.
- Commit messages: `feat: ...`, `fix: ...`, `chore: ...`.
- Do not use `npm audit fix --force`. Do not create nested git repos.

## 11. Do not

- Do not use TypeScript, class components, or web-only APIs (`div`, `window`, `localStorage`, CSS files).
- Do not add a package without asking; use `npx expo install` when you do.
- Do not force-kill the Android emulator process (it leaves crash records that block the next start). Close it
  from its window or with `adb emu kill`.
- Do not edit `android/` or `ios/` by hand (they are generated); configure native behavior in `app.json` and plugins.
- Do not commit secrets, `.env` files, `node_modules`, or generated folders.
- Do not touch `app/onboarding`, `src/lib`, `apps/api` or the Tailwind theme unless the task says so.

## 12. Where things stand

Done: project setup, onboarding O1 to O3 (state driven, animated, haptics, location permission), launch gate with
saved flag, home placeholder, API skeleton connected to Neon (`GET /health`).
Next (owner): live bus backend (Route/Bus/BusState, device ping endpoint, `GET /buses`, bus simulator), S1 map view,
ETA and "time to leave", driver sign-in, deploy, development build.

**Good tasks for a second developer** (new files only, fake data first, one branch each):
1. `src/components/SeatMap.jsx`: 40 seats from an array of 0/1 (taken/free), legend. Figma S2.
2. `src/components/BusCard.jsx`: bus list card (number, line name, seats free, ETA, "Live 8s ago", stale variant). Figma S1.
3. `app/bus/[id].jsx`: S2 Bus details (live) with fake data, using `SeatMap`. Figma S2.
4. Same screen, stale variant ("Seats unavailable", "Signal lost"). Figma S3.
5. `app/(tabs)/settings.jsx`: S12 Settings, static UI. Figma S12.

Definition of done for any task: runs on the Pixel 7 emulator and on a 360x640 screen, matches the Figma frame,
uses the existing theme and components, touches no unrelated files, and the pull request explains what changed
and how to test it.

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
| `verification-before-completion` | No "done / works / fixed" until you ran the check and read the real output (curl, emulator, `expo export`, `prisma validate`) | Automatically, before claiming success or committing |
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
