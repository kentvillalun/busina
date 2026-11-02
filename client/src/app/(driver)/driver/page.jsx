"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import dynamic from "next/dynamic";
import { useState } from "react";
import DriverDrawer from "@/components/driver/DriverDrawer";
import DriverSheet from "@/components/driver/DriverSheet";
import MenuButton from "@/components/driver/MenuButton";
import TopGradient from "@/components/layout/TopGradient";
import useDriverOverview from "@/hooks/useDriverOverview";
import { useRoutes } from "@/hooks/useRoutes";
import { DIRECTION_LABEL, driverMode, MODE_COPY } from "@/lib/driverMode";
import { secondsSince } from "@/lib/time";

const BusMap = dynamic(() => import("@/components/map/BusMap"), { ssr: false });

const LAOAG = [18.1978, 120.5936]; // map center until the bus has reported a position

const PILL = {
  live: { dot: "bg-primary", text: "text-ink" },
  rest: { dot: "bg-uncertain", text: "text-ink" },
  stopover: { dot: "bg-navy", text: "text-ink" },
  lost: { dot: "bg-fault", text: "text-fault" },
};
const PILL_LABEL = { live: "Live", rest: "At rest", stopover: "Stopover", lost: "Signal lost" };
const BANNER = { rest: "bg-uncertain-bg text-ink", stopover: "bg-stage text-ink", lost: "bg-fault/10 text-fault" };

const StatusPill = ({ mode, seconds }) => (
  <span className={`flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-bold shadow-sm ${PILL[mode].text}`}>
    <span className={`size-2 rounded-full ${PILL[mode].dot}`} />
    {PILL_LABEL[mode]}
    {mode === "live" && seconds != null && <span className="font-medium text-muted">{seconds}s</span>}
  </span>
);

// Which bus, which way and what commuters see: over the map on a phone, at the top of the side panel from md up.
const Intro = ({ bus, directionLabel, mode, big }) => {
  const copy = MODE_COPY[mode];
  return (
    <div>
      <p className="text-[13px] font-medium text-secondary">Driver · {directionLabel}</p>
      <h1 className={`font-display leading-tight text-ink ${big ? "text-[32px]" : "text-[26px]"}`}>Bus {bus.busNumber}</h1>
      <p className="text-sm font-semibold text-navy">{copy.line}</p>
      {copy.banner && (
        <p role="status" className={`mt-3 rounded-[14px] px-3.5 py-2.5 text-[13px] font-semibold ${BANNER[mode]}`}>
          {copy.banner}
        </p>
      )}
    </div>
  );
};

// The driver's screen: the map with the bus and the people waiting ahead, the At rest and Stopover switches, and the menu.
export default function DriverPage() {
  const { data, offline, error, changeStatus } = useDriverOverview();
  const routes = useRoutes();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!data) {
    return (
      <main className="grid min-h-svh place-items-center bg-stage px-6 text-center text-[15px] font-medium text-muted">
        {offline ? "Cannot reach the server. Trying again..." : "Loading your bus..."}
      </main>
    );
  }

  const { bus, position, pickups } = data;
  const mode = driverMode(data);
  const directionLabel = DIRECTION_LABEL[position?.direction] ?? "Direction not known yet";
  const dim = mode === "rest" || mode === "lost";

  const buses = position
    ? [{ id: bus.id, busNumber: bus.busNumber, stale: position.stale, state: { lat: position.lat, lng: position.lng } }]
    : [];
  const seconds = position ? secondsSince(data.serverTime, position.lastPingAt) : null;

  return (
    <main className="fixed inset-0 isolate bg-stage">
      <div className="absolute inset-0 z-0 md:right-82">
        <BusMap
          buses={buses}
          routes={routes.filter((route) => route.id === bus.routeId)}
          direction={position?.direction ?? undefined}
          pickups={mode === "live" || mode === "stopover" ? (pickups ?? []) : []}
          selectedId={bus.id}
          center={position ? [position.lat, position.lng] : LAOAG}
        />
        {dim && <div className="pointer-events-none absolute inset-0 z-5 bg-white/50" />}
        <TopGradient className="z-10 h-72" />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-[max(1rem,env(safe-area-inset-top))] md:right-82">
        <div className="pointer-events-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <img src="/logo.svg" alt="Busina" width={96} height={31} />
          </div>
          <StatusPill mode={mode} seconds={seconds} />
        </div>
        <div className="mt-3 px-2 md:hidden">
          <Intro bus={bus} directionLabel={directionLabel} mode={mode} />
        </div>
        {offline && (
          <p role="status" className="mt-3 rounded-[14px] bg-white px-3.5 py-2 text-[13px] font-semibold text-fault shadow-sm">
            Connection lost. Showing the last update.
          </p>
        )}
      </header>

      <DriverSheet
        mode={mode}
        pickups={pickups}
        status={bus.serviceStatus}
        onStatus={changeStatus}
        error={error}
        intro={<Intro bus={bus} directionLabel={directionLabel} mode={mode} big />}
      />

      <DriverDrawer open={menuOpen} onClose={() => setMenuOpen(false)} bus={bus} directionLabel={directionLabel} />
    </main>
  );
}
