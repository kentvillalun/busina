"use client";

// DEV ONLY: every visual state of the home pieces on one page. Delete this folder before the demo.
import dynamic from "next/dynamic";
import { useState } from "react";
import AlertsSheet from "@/components/home/AlertsSheet";
import BusCard from "@/components/home/BusCard";
import BusCardSkeleton from "@/components/home/BusCardSkeleton";
import LoadError from "@/components/home/LoadError";
import DirectionTab from "@/components/home/DirectionTab";
import LiveStatus from "@/components/home/LiveStatus";
import LocationBanner from "@/components/home/LocationBanner";
import IconLocationOff from "@/components/icons/IconLocationOff";

const BusMap = dynamic(() => import("@/components/map/BusMap"), { ssr: false });

const SERVER_TIME = "2026-10-30T02:00:00.000Z";
const bus = (id, busNumber, over = {}, state = {}) => ({
  id,
  busNumber,
  name: "Sample Line Express",
  seatCount: 40,
  stale: false,
  state: {
    direction: "NORTHBOUND",
    lat: 18.1998,
    lng: 120.5942,
    seatsFree: 9,
    onBoard: 31,
    standing: 0,
    lastPingAt: "2026-10-30T01:59:52.000Z",
    ...state,
  },
  ...over,
});

const CARDS = [
  { label: "Closest, with ETA (selected)", selected: true, bus: bus("1", "214", { etaMin: 4 }) },
  { label: "Live, no ETA yet (what the API sends today)", bus: bus("2", "118") },
  {
    label: "Full, people standing",
    bus: bus("3", "305", { etaMin: 31 }, { seatsFree: 0, standing: 6, onBoard: 46 }),
  },
  {
    label: "Signal lost",
    bus: bus("4", "087", { stale: true }, { lastPingAt: "2026-10-30T01:56:40.000Z" }),
  },
];

const PINS = [
  bus("a", "214", {}, { lat: 18.1985, lng: 120.5925 }),
  bus("b", "118", {}, { lat: 18.2008, lng: 120.5965 }),
  bus("c", "087", { stale: true }, { lat: 18.1965, lng: 120.5955 }),
  bus("d", "0015", {}, { lat: 18.2022, lng: 120.5915 }),
];

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="mb-2 font-display text-lg text-ink">{title}</h2>
    {children}
  </section>
);

export default function DevStates() {
  const [alertsOpen, setAlertsOpen] = useState(false);
  return (
    <main className="mx-auto h-dvh max-w-md overflow-y-auto bg-stage p-4">
      <h1 className="mb-6 font-display text-2xl text-ink">States (dev only)</h1>

      <Section title="Map pins: selected, live, signal lost, long number + you">
        <div className="relative isolate h-80 overflow-hidden rounded-2xl">
          <BusMap
            buses={PINS}
            me={{ lat: 18.1998, lng: 120.5942 }}
            selectedId="a"
            center={[18.1998, 120.5942]}
          />
        </div>
      </Section>

      <Section title="Bus cards">
        <div className="flex flex-col gap-4">
          {CARDS.map(({ label, bus: item, selected }) => (
            <div key={label}>
              <p className="mb-1 text-xs font-medium text-muted">{label}</p>
              <BusCard bus={item} serverTime={SERVER_TIME} selected={selected} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Header pieces">
        <div className="flex flex-wrap items-center gap-3">
          <LiveStatus seconds={3} />
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
            Can&apos;t connect. Try again
          </span>
        </div>
        <div className="mt-4 flex gap-1 rounded-[18px] bg-white p-1.5">
          <DirectionTab item={{ title: "Northbound", hint: "toward Laoag" }} selected onPress={() => {}} />
          <DirectionTab item={{ title: "Southbound", hint: "toward Vigan" }} onPress={() => {}} />
        </div>
      </Section>

      <Section title="Location off (no permission)">
        <p className="mb-1 text-xs font-medium text-muted">Header line</p>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-navy">
          <IconLocationOff className="size-4" />
          Location is off
        </p>
        <p className="text-xs font-medium text-muted">Not asked yet (can still prompt)</p>
        <LocationBanner permission={{ granted: false, canAskAgain: true, supported: true }} onTurnOn={() => {}} />
        <p className="mt-3 text-xs font-medium text-muted">Blocked in the browser</p>
        <LocationBanner permission={{ granted: false, canAskAgain: false, supported: true }} onCheckAgain={async () => ({ granted: false })} />
        <p className="mt-3 text-xs font-medium text-muted">Browser has no location</p>
        <LocationBanner permission={{ granted: false, canAskAgain: false, supported: false }} />
        <p className="mb-1 mt-3 text-xs font-medium text-muted">Bus card while location is off</p>
        <BusCard bus={bus("9", "214", { etaMin: 4 })} serverTime={SERVER_TIME} selected locationOff />
      </Section>

      <Section title="Alerts sheet (notifications)">
        <button
          type="button"
          onClick={() => setAlertsOpen(true)}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm"
        >
          Open the sheet
        </button>
        <AlertsSheet open={alertsOpen} onAllow={() => setAlertsOpen(false)} onDismiss={() => setAlertsOpen(false)} />
      </Section>

      <Section title="Loading and error in the sheet">
        <p className="mb-1 text-xs font-medium text-muted">Loading (a closed sheet shows the first, an open one all three)</p>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => <BusCardSkeleton key={i} />)}
        </div>
        <p className="mb-1 mt-4 text-xs font-medium text-muted">Could not load at all</p>
        <LoadError onRetry={() => {}} />
        <p className="mb-1 mt-4 text-xs font-medium text-muted">Connection lost after data (notice above the list)</p>
        <div className="flex items-center justify-between gap-2 rounded-xl bg-uncertain-bg px-3 py-2 text-xs text-uncertain">
          <span>Connection lost. Showing the last update.</span>
          <span className="shrink-0 font-bold text-primary">Try again</span>
        </div>
      </Section>

      <Section title="Messages in the sheet">
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 text-sm text-muted">
          <p>No buses going this direction right now.</p>
        </div>
      </Section>
    </main>
  );
}
