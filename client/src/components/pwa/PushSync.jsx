"use client";

import { useEffect } from "react";
import useSession from "@/hooks/useSession";
import { PUSH_SYNC_EVENT, syncPush, usesLocation } from "@/lib/push";

// Keeps the server's push subscription in step with the saved settings (spot, minutes, direction, chosen bus, alerts on).
// It syncs on start (which also repairs a subscription the browser replaced) and whenever a setting is saved.
// In location mode the server holds a snapshot of the position, so it is refreshed while the app is open: every 30 s and
// each time the app comes back to the front. What the server has is then at most ~30 s older than the moment the app closed.
const PushSync = () => {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "user") return; // a guest has no account to keep a subscription under
    let timer;
    let running = false;
    let again = false;

    const run = async () => {
      if (running) {
        again = true; // a setting changed mid-sync: go once more with the newest values
        return;
      }
      running = true;
      await syncPush();
      running = false;
      if (again) {
        again = false;
        run();
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(run, 600); // several settings can be saved in a row
    };

    const refresh = () => {
      if (document.visibilityState === "visible" && usesLocation()) schedule();
    };

    schedule();
    window.addEventListener(PUSH_SYNC_EVENT, schedule);
    document.addEventListener("visibilitychange", refresh);
    const interval = setInterval(refresh, 30_000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener(PUSH_SYNC_EVENT, schedule);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [status]);

  return null;
};

export default PushSync;
