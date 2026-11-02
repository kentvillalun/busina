"use client";

import { useEffect } from "react";
import useStaffSession from "@/hooks/useStaffSession";
import { staffLogout } from "@/lib/staffSession";

// Placeholder behind the driver sign-in: it proves the session works end to end. The map, the At rest and Stopover
// toggles and the menu come in the next slices.
export default function DriverPage() {
  const { status, bus } = useStaffSession();

  // The proxy already sends signed-out drivers away; this covers a session that was revoked while the page was open.
  useEffect(() => {
    if (status === "guest") window.location.replace("/driver/login?expired=1");
  }, [status]);

  if (status !== "driver") return null;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-107.5 flex-col justify-center px-6 md:max-w-100">
      <p className="text-[13px] font-medium text-muted">Signed in</p>
      <h1 className="font-display text-[30px] leading-[1.2] text-ink">Bus {bus.busNumber}</h1>
      <p className="mt-3 text-[15px] leading-6 text-muted">The map of pickups ahead is coming next.</p>
      <button
        type="button"
        onClick={() => staffLogout()}
        className="mt-8 h-14 w-full rounded-[18px] border-[1.5px] border-line text-[16px] font-semibold text-muted active:opacity-80"
      >
        Sign out
      </button>
    </main>
  );
}
