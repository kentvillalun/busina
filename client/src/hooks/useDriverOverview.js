"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_MS = 4000; // same rhythm as the commuter map
const MAX_FAILURES = 2;

// The driver screen's data: the bus, where it is and who is waiting ahead, refreshed every few seconds.
// Not useFetch: that one sends a 401 to the commuter sign-in, and a driver belongs on /driver/login.
// Returns { data, offline, error, changeStatus }; `data` keeps the last answer while the connection is down.
const useDriverOverview = () => {
  const [data, setData] = useState(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");
  const failures = useRef(0);
  const leaving = useRef(false);
  const latest = useRef(null);

  const signedOut = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    window.location.replace("/driver/login?expired=1");
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/staff/overview", { cache: "no-store" });
      if (response.status === 401) return signedOut();
      if (!response.ok) throw new Error("bad answer");
      const next = await response.json();
      latest.current = next;
      setData(next);
      failures.current = 0;
      setOffline(false);
    } catch {
      failures.current += 1;
      if (failures.current >= MAX_FAILURES) setOffline(true);
    }
  }, [signedOut]);

  useEffect(() => {
    const first = setTimeout(load, 0); // not a direct call: the lint rule keeps setState out of the effect body
    const timer = setInterval(load, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  // The switch moves at once and goes back if the server says no, so a bad signal never leaves it lying.
  const changeStatus = useCallback(
    async (status) => {
      const before = latest.current;
      if (!before || before.bus.serviceStatus === status) return;
      setError("");
      const withStatus = (source, serviceStatus) => ({ ...source, bus: { ...source.bus, serviceStatus } });
      latest.current = withStatus(before, status);
      setData(latest.current);
      try {
        const response = await fetch("/api/staff/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (response.status === 401) return signedOut();
        if (!response.ok) throw new Error("rejected");
        load(); // pickups depend on the status
      } catch {
        latest.current = before;
        setData(before);
        setError("Could not change the status. Check your connection.");
      }
    },
    [load, signedOut],
  );

  return { data, offline, error, changeStatus };
};

export default useDriverOverview;
