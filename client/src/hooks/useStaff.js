"use client";

import { useCallback, useEffect, useState } from "react";

// The staff roster from GET /api/operator/staff, loaded once and again when `reload` is called (after an add or an edit).
// Not useFetch: that one sends a 401 to the commuter sign-in, and an operator belongs on /operator/login.
// Returns { staff, loaded, failed, reload }; `failed` is true while the first load has not worked.
const useStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const response = await fetch("/api/operator/staff", { cache: "no-store" });
      if (response.status === 401) return window.location.replace("/operator/login?expired=1");
      if (!response.ok) throw new Error("bad answer");
      setStaff((await response.json()).staff);
      setLoaded(true);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0); // not a direct call: the lint rule keeps setState out of the effect body
    return () => clearTimeout(first);
  }, [load]);

  return { staff, loaded, failed: failed && !loaded, reload: load };
};

export default useStaff;
