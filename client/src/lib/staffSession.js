// A full page load (not router.push): Next keeps hidden pages alive, so their state would survive a soft navigation.
export const staffLogout = async (to = "/driver/login") => {
  try {
    // JavaScript cannot delete an httpOnly cookie, the server does
    await fetch("/api/staff/logout", { method: "POST" });
  } catch {}
  window.location.replace(to);
};
