"use client";

import { useEffect } from "react";
import { PUSH_SYNC_EVENT, syncPush } from "@/lib/push";

// Keeps the server's push subscription in step with the saved settings (spot, minutes, direction, chosen bus, alerts on).
// It syncs on start (which also repairs a subscription the browser replaced) and whenever a setting is saved.
const PushSync = () => {
  useEffect(() => {
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

    schedule();
    window.addEventListener(PUSH_SYNC_EVENT, schedule);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(PUSH_SYNC_EVENT, schedule);
    };
  }, []);

  return null;
};

export default PushSync;
