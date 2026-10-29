# apps/mobile

Read the **root `AGENTS.md`** first (`../../AGENTS.md`). It is the source of truth for the stack, conventions,
design tokens, Figma references and git workflow. This file only adds the mobile-specific reminders below.

This is an Expo SDK 57 / React Native app written in **JavaScript** (no TypeScript).

## Expo has changed: do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember may be renamed, moved or removed. Before writing
code that touches an Expo, EAS or React Native API:

1. Read the major version of `expo` in `package.json` (currently 57).
2. Fetch the matching docs: `https://docs.expo.dev/versions/v57.0.0/` (e.g. `/sdk/location/`).
3. For anything else, fetch https://docs.expo.dev/llms.txt and follow its links. Do not answer from memory.

## Commands

```bash
npm install
npx expo start --clear        # then "a" for the Android emulator
npx expo install <package>    # always use this to add packages (picks SDK-compatible versions)
npx expo-doctor               # diagnose dependency and config problems
npx expo install --fix        # fix incompatible package versions
```

There is no TypeScript and no lint setup yet, so there is no typecheck or lint step. Verify a change by running
it on the emulator (and on a 360x640 screen), and check that `npx expo export --platform android` still compiles.

## Routing

- **Expo Router**, routes live in `app/` (not `src/app/`). Every file there is a screen; `_layout.jsx` files define
  navigators. Keep components, hooks and helpers in `src/`, outside `app/`.
- Import `Link`, `router`, `useLocalSearchParams` from `expo-router`.

## Rules

- `android/` and `ios/` do not exist and are generated on build; never create or edit them by hand. Native behavior
  goes in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. `expo-notifications` does not work in Expo Go; real alerts need a
  development build (`eas build --profile development` or `npx expo run:android`).
- Prefer Expo modules over third-party libraries, and ask before adding any dependency.
