# PWA platform notes: permissions, haptics, Android vs iPhone

A skim sheet for review and for the Q&A. Everything here is a browser feature that is built in (no
native code). Status words: **works** = tested in the code, **expected** = known browser behavior we
have not tested on a real phone, **todo** = not built yet.

## 1. What we use

| Need | Browser API (built in) | Our code |
|---|---|---|
| Ask for the location | Geolocation API: `navigator.geolocation.getCurrentPosition()` | `askLocation()` in `client/src/lib/permissions.js` |
| Know if location was allowed | Permissions API: `navigator.permissions.query({ name: "geolocation" })` | `getLocationPermission()` |
| Ask to show notifications | Notifications API: `Notification.requestPermission()` | `askAlerts()` |
| Know if notifications were allowed | `Notification.permission` | `getAlertsPermission()` |
| Vibrate on Android | Vibration API: `navigator.vibrate()`, through the `bzzz` library | `haptic.light()` etc. in `client/src/lib/haptics.js` |
| Haptic on iPhone | A hidden `<input type="checkbox" switch>` that must be tapped by a real finger, through the `ios-haptics` library | `ref={hapticTrigger}` on a button |
| Animation | `motion` library | the onboarding scenes and carousel |

The permission helpers return `{ granted, canAskAgain, supported }`. The browser remembers the
answer, so we do not store it: call the getter again on any page.

## 2. How to read the values

```js
// Permission state (no prompt):
const loc = await getLocationPermission();    // { granted, canAskAgain, supported }
const alerts = await getAlertsPermission();

// The actual position (todo: the web helper is not written yet, the old app had one):
navigator.geolocation.getCurrentPosition((pos) => {
  const { latitude, longitude, accuracy } = pos.coords;
});
// navigator.geolocation.watchPosition(...) for a moving user.
```

Raw browser values: location is `"granted"`, `"denied"` or `"prompt"` (not asked yet); notifications are
`"granted"`, `"denied"` or `"default"` (not asked yet).

## 3. Android vs iPhone

| Feature | Android (Chrome) | iPhone (Safari, and other iOS browsers) |
|---|---|---|
| Location prompt | expected | expected (needs https). The permission may be asked again more often in an installed app |
| Permission state query | works | Safari 16 and later; our helper has a fallback if it is missing |
| Notification permission | works | **Only for a web app installed to the Home Screen, iOS 16.4 and later.** In a normal Safari tab `Notification` does not exist, so `askAlerts()` returns `supported: false` and onboarding just continues |
| Push when the app is closed | **todo** (service worker + `web-push`) | **todo**, same Home Screen rule |
| Vibration (`navigator.vibrate`) | works | **not supported** |
| Haptic feedback | `haptic.light()` (vibration) | `ref={hapticTrigger}` from `ios-haptics`, Safari 17.4 and later |
| Install | Chrome offers it when there is a manifest and https; can become an APK (TWA) | No automatic prompt: the user taps Share, then "Add to Home Screen". No APK |

Source for the iOS rows: the Next.js PWA guide bundled in
`client/node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md` (iOS 16.4+, installed to
the Home Screen; no `beforeinstallprompt` on Safari iOS).

## 4. Haptics: why two libraries

- On iPhone a haptic only fires when a **real touch** hits a switch element. The `bzzz` library calls
  `label.click()` from JavaScript, which is not a real touch, so it does nothing on iPhone (tested by the
  owner). `bzzz` is still used for Android vibration.
- `ios-haptics` puts a transparent label with a hidden switch **on top of the button**, so the user's own
  tap hits the switch. It does nothing on other devices.
- Our `haptic.light()` etc. skip iPhone so a tap never buzzes twice.

Adding haptics to a new button needs both:

```jsx
import { haptic, hapticTrigger } from "@/lib/haptics";

<button ref={hapticTrigger} onClick={() => { haptic.light(); doThing(); }}>...</button>
```

## 5. Limits to admit if asked

- Permissions are asked from a tap and need **https** (or `localhost`). A phone opening
  `http://192.168...` is blocked for location and notifications. Test on a phone through an https URL
  (deployed site, or `next dev --experimental-https`).
- If the user says no, the browser will not ask again (`canAskAgain: false`). The only way back is the
  site settings of the browser.
- Location is asked only while the app is open. There is no background tracking.
- The Vibration API does not exist on iPhone.
- Alerts when the app is closed are not built yet.
- A PWA does not use the Android SDK. In the judging, the "Effective use of the Android platform" criterion
  is argued through: GPS (Geolocation), system notifications (Notifications and Push), install to the home
  screen, vibration, offline support, and the Android APK packaged from the PWA.

## 6. Answers for the Q&A

| Question | Short answer |
|---|---|
| How do you get the location? | The browser's Geolocation API, which uses the phone's GPS. It asks the user first, and only while the app is open. |
| How do alerts work? | The Notifications and Push APIs through a service worker. They appear as normal Android notifications. (Push is the next step.) |
| Why not a native app? | One codebase for every phone, installable from the browser, and packaged as an APK when needed. The cost is that some Android APIs are out of reach for the web. |
| Is it secure? | These APIs only work on https and always need the user's permission; a site cannot use them silently. |
| Does it work on iPhone? | Location yes. Alerts yes once it is installed to the Home Screen (iOS 16.4+). The APK is Android only. |

## 7. What was tested

- The onboarding flow with the permission prompts **replaced by stubs** in a desktop browser, including that
  three quick taps open only one prompt.
- The iPhone haptic DOM (the label over the button) by simulating an iPhone user agent: the label covers the
  button and a tap on it still reaches the button's `onClick`.
- **Not tested:** the real permission prompts, a real iPhone haptic, a real Android vibration.

## 8. Still to do for this area

- Web manifest, service worker, and Web Push (VAPID keys, `web-push` on the server).
- A `getCurrentPosition()` helper in `permissions.js` for the "closest bus" on the home page.
- An iPhone hint to add the app to the Home Screen before asking for notifications.
- A short explanation in Settings of how to turn a permission back on after a "no".
