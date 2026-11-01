// What belongs to the signed-in person on this phone. Cleared on logout so the next person on a shared phone does not
// inherit someone's boarding spot or chosen bus.
const PRIVATE_KEYS = ["busina:spot", "busina:alertBus"];

// Onboarding is shown once. The proxy reads the cookie (it cannot read localStorage) to send first-time visitors to it
// before Home is drawn. The localStorage copy is kept for people who finished it before the cookie existed.
export const markOnboardingSeen = () => {
  try {
    localStorage.setItem("hasSeenOnboarding", "true");
  } catch {}
  document.cookie = "hasSeenOnboarding=1; path=/; max-age=31536000; samesite=lax";
};

// A full page load (not router.push): Next keeps hidden pages alive, so their state would survive a soft navigation.
export const logout = async (to = "/login") => {
  try {
    await fetch("/api/auth/logout", { method: "POST" }); // JavaScript cannot delete an httpOnly cookie, the server does
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
