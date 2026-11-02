"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ago } from "@/lib/time";

const POLL_MS = 4000; // same rhythm as the commuter and driver screens
const MAX_FAILURES = 2;

// The operator's fleet from GET /api/operator/fleet, refreshed every few seconds and as soon as the app comes back to the front.
// Not useFetch: that one sends a 401 to the commuter sign-in, and an operator belongs on /operator/login.
// Returns { fleet, loaded, offline }; `fleet` keeps the last answer while the connection is down.
const useFleet = () => {
  const [fleet, setFleet] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);
  const failures = useRef(0);
  const leaving = useRef(false);
  const issued = useRef(0);
  const applied = useRef(0);

  const load = useCallback(async () => {
    const mine = ++issued.current;
    try {
      const response = await fetch("/api/operator/fleet", { cache: "no-store" });
      if (response.status === 401) {
        if (!leaving.current) window.location.replace("/operator/login?expired=1");
        leaving.current = true;
        return;
      }
      if (!response.ok) throw new Error("bad answer");
      const { serverTime, buses } = await response.json();
      if (mine < applied.current) return; // a newer answer already arrived (two refreshes overlapped)
      applied.current = mine;
      setFleet(buses.map((bus) => ({ ...bus, lastUpdate: bus.lastPingAt ? ago(serverTime, bus.lastPingAt) : "Never" })));
      setLoaded(true);
      failures.current = 0;
      setOffline(false);
    } catch {
      failures.current += 1;
      if (failures.current >= MAX_FAILURES) setOffline(true);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0); // not a direct call: the lint rule keeps setState out of the effect body
    const refresh = () => document.visibilityState === "visible" && load();
    const timer = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);

  return { fleet, loaded, offline };
};

export default useFleet;
