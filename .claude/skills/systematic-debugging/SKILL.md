---
name: systematic-debugging
description: Use when something is broken or behaves unexpectedly (an error, a crash, a screen that looks wrong, a request that fails), before proposing any fix. Find the root cause first, then fix once.
---

<!-- Adapted for Busina from "systematic-debugging" in obra/superpowers (MIT). See THIRD-PARTY-LICENSES.md. -->

# Systematic debugging

**Rule: no fix before you know the root cause.** Guessing and stacking fixes costs more time than investigating.

Use it for any bug, build error, failed request or odd behavior, **especially** when you are tired, in a hurry,
or the "obvious" fix feels certain.

## The four phases (finish each before the next)

### 1. Find the cause
1. **Read the whole error.** Message, file, line, stack. It often names the fix.
2. **Reproduce it** with exact steps, and make it fail the same way twice. If you cannot, gather more data; do not guess.
3. **Check what changed**: `git diff`, a newly installed package, a config or `.env` edit.
4. **Look at each boundary.** This project is a chain: *app, then API, then middlewares, then Prisma, then Neon*. Find where
   the data stops being right: does the request leave the app? Reach the API? Pass validation and the device key check?
   Does the row get written? Does `GET /buses` return it? Log or `curl` at each step and find the first broken link.
5. **Trace backwards** from the bad value to where it first went wrong. Fix it there, not where it shows up.

### 2. Compare with something that works
Find similar working code in this repo (a component, a route, a middleware). List every difference, however small.

### 3. One hypothesis at a time
Write it down: "I think X is the cause because Y". Change **one** thing to test it. If it does not work, form a new
hypothesis; do not pile another change on top. If you do not know, say "I don't understand X" and ask.

### 4. Fix it once
- Make a small reproduction first: a `curl` command, a short script, or a written checklist of steps. An automated
  test only if the project already has tests for that area.
- Fix the root cause with **one** change. No "while I'm here" cleanups.
- Verify with the same reproduction (see the `verification-before-completion` skill).
- **After 3 failed fixes, stop.** The problem is probably the design, not the code. Talk to the project owner before attempt 4.

## Red flags: stop and go back to phase 1
"Quick fix now, investigate later", "just try changing X", several changes at once, proposing a fix before tracing
the data, "one more attempt" after two failures, each fix revealing a new problem somewhere else.

## Known culprits in this repo (check these early)
- **"Cannot find module" right after installing a package**: Metro is caching its file list. Restart with `npx expo start --clear`.
- **NativeWind class does nothing**: a decimal value in the class (`w-[13.76px]`) is ignored; use `style`. Also check `tailwind.config.js` `content` paths.
- **A config file "does nothing" or CSS fails to parse**: a hidden BOM added by PowerShell's `Set-Content -Encoding utf8`. Write files without a BOM.
- **A package crashes the app in Expo Go** (for example `expo-notifications`): it needs a development build. Guard with `requireOptionalNativeModule`.
- **Prisma migrate hangs or fails**: it must use `DATABASE_URL_UNPOOLED` (no `-pooler` in the host); Neon may also be asleep, so retry once.
- **Android emulator will not start**: leftover crash records in `%TEMP%\AndroidEmulator`, or not enough free disk. Never force-kill the emulator.
- **A real phone cannot open the project**: Expo Go from the Play Store may be a newer SDK than this project (SDK 57).
- **Nested git repository**: a generator created `.git` inside `apps/*`; delete it.
- **The app reaches the API on the emulator but not on a phone**: the emulator uses `10.0.2.2`; a real phone needs the deployed HTTPS address.

## When there is truly no root cause
If it is environmental or timing related (Neon asleep, no signal): write down what you checked, add sensible handling
(a retry, a clear error message, a log), and move on. Most "no root cause" cases are an incomplete investigation.
