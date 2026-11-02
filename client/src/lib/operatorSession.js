// A full page load (not router.push): Next keeps hidden pages alive, so their state would survive a soft navigation.
export const operatorLogout = async (to = "/operator/login") => {
  try {
    // JavaScript cannot delete an httpOnly cookie, the server does
    await fetch("/api/operator/logout", { method: "POST" });
  } catch {}
  window.location.replace(to);
};
