// "I'm waiting here": the commuter lets drivers see an anonymous marker where they wait (WaitingSpot on the server, 30 minutes).
// Every function answers with a word or a value and never throws, so a bad connection cannot break the screen that called it.

const SHARE_UNTIL_KEY = "busina:shareUntil"; // when the last "yes" ends, so the app does not ask again while it still counts

const call = async (method, body) => {
  try {
    return await fetch("/api/waiting", {
      method,
      ...(body && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
  } catch {
    return null;
  }
};

const remember = (until) => {
  try {
    if (until) localStorage.setItem(SHARE_UNTIL_KEY, String(until));
    else localStorage.removeItem(SHARE_UNTIL_KEY);
  } catch {}
};

// True while the commuter's last "yes" is still running on this phone.
export const isSharing = () => {
  try {
    return Number(localStorage.getItem(SHARE_UNTIL_KEY)) > Date.now();
  } catch {
    return false;
  }
};

// `point` is { lat, lng, direction }. Returns "shared", "guest", "slow-down" or "failed".
export const shareWaiting = async (point) => {
  const response = await call("PUT", point);
  if (!response) return "failed";
  if (response.status === 401) return "guest";
  if (response.status === 429) return "slow-down";
  if (!response.ok) return "failed";
  remember(new Date((await response.json()).expiresAt).getTime());
  return "shared";
};

export const stopWaiting = async () => {
  remember(null);
  const response = await call("DELETE");
  return response?.ok ? "stopped" : "failed";
};

// { sharing, expiresAt } from the server, or null when it cannot be known (guest, offline).
export const waitingStatus = async () => {
  const response = await call("GET");
  if (!response?.ok) return null;
  const status = await response.json();
  remember(status.sharing ? new Date(status.expiresAt).getTime() : null);
  return status;
};
