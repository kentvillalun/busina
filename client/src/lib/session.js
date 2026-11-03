// What belongs to the signed-in person on this phone. Cleared on logout so the next person on a shared phone does not
// inherit someone's boarding spot or chosen bus.
const PRIVATE_KEYS = ["busina:spot", "busina:alertBus", "busina:target"];

// Onboarding is shown once. The proxy reads the cookie (it cannot read localStorage) to send first-time visitors to it
// before Home is drawn. The localStorage copy is kept for people who finished it before the cookie existed.
// The installed app (Home Screen, or the Android APK) shares its storage and cookies with the browser it came from, so it
// keeps its own flag: opening it for the first time shows onboarding even if the website was already visited.
const isInstalledApp = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  navigator.standalone === true ||
  document.referrer.startsWith("android-app://");
const seenKey = () => (isInstalledApp() ? "hasSeenOnboarding:app" : "hasSeenOnboarding");

// Storage blocked: assume seen, or onboarding and Home would send each other around.
export const hasSeenOnboarding = () => {
  try {
    return Boolean(localStorage.getItem(seenKey()));
  } catch {
    return true;
  }
};

export const markOnboardingSeen = () => {
  try {
    localStorage.setItem(seenKey(), "true");
  } catch {}
  document.cookie = "hasSeenOnboarding=1; path=/; max-age=31536000; samesite=lax";
};

// A full page load (not router.push): Next keeps hidden pages alive, so their state would survive a soft navigation.
export const logout = async (to = "/login") => {
  // This browser's push subscription (there is none until alerts are turned on) is removed with the session, so the next
  // person on a shared phone does not get the old alerts. getRegistration resolves at once even with no service worker.
  let subscription = null;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    subscription = (await registration?.pushManager?.getSubscription()) ?? null;
  } catch {}

  try {
    // JavaScript cannot delete an httpOnly cookie, the server does
    await fetch("/api/auth/logout", {
      method: "POST",
      ...(subscription && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      }),
    });
  } catch {}
  try {
    await subscription?.unsubscribe();
  } catch {}
  try {
    for (const key of PRIVATE_KEYS) localStorage.removeItem(key);
  } catch {}
  window.location.replace(to);
};

// Any API call answered 401: the session is gone. Runs once, however many requests fail together.
let leaving = false;
export const handleUnauthorized = () => {
  if (leaving) return;
  leaving = true;
  logout("/login?expired=1");
};
