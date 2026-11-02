"use client";

import { formatDistance } from "@/lib/geo";
import { haptic, hapticTrigger } from "@/lib/haptics";

// A switch that is a button, so a gloved or shaking hand has a large target (Figma toggle cards).
const ToggleCard = ({ title, hint, on, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    ref={hapticTrigger}
    onClick={() => {
      haptic.light();
      onChange(!on);
    }}
    className={`flex min-h-17 flex-1 items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-left active:opacity-80 ${
      on ? "border-2 border-primary bg-stage" : "border-[1.5px] border-line bg-white"
    }`}
  >
    <span className="flex flex-col">
      <span className="text-base font-bold text-ink">{title}</span>
      <span className="text-xs font-medium text-muted">{hint}</span>
    </span>
    <span className={`relative h-7 w-11.5 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-line"}`}>
      <span className={`absolute top-0.75 size-5.5 rounded-full bg-white shadow transition-all ${on ? "left-5.25" : "left-0.75"}`} />
    </span>
  </button>
);

const PickupRow = ({ pickup, first }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-[15px] font-bold text-white">
        {pickup.count}
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold text-ink">{pickup.count} waiting</span>
        <span className="text-xs font-medium text-muted">{first ? "Next stop along your route" : "Further ahead"}</span>
      </span>
    </div>
    <span className="font-bold text-primary">{formatDistance(pickup.distanceM)}</span>
  </div>
);

const MESSAGES = {
  rest: "You are at rest. Pickups come back when you switch to in service.",
  lost: "Pickups need a live bus position. They return when the signal does.",
};

// The "Pickups ahead" panel and the two status switches (Figma D2 to D5). On a phone it is the sheet at the bottom; from md up
// it is the panel on the right, where `intro` (which bus, which way, what commuters see) also lives.
const DriverSheet = ({ mode, pickups, status, onStatus, error, intro }) => {
  const rows = (pickups ?? []).slice(0, 3);
  const waiting = (pickups ?? []).reduce((total, pickup) => total + pickup.count, 0);
  const heading = mode === "rest" ? "Paused" : mode === "lost" ? "Unavailable" : waiting > 0 ? `${waiting} waiting` : "None yet";

  return (
    <section
      className="fixed inset-x-0 bottom-0 z-20 flex flex-col gap-3 rounded-t-[28px] bg-white px-5 pt-2.5 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(15,34,51,0.05)] md:inset-x-auto md:inset-y-0 md:right-0 md:w-82 md:gap-4 md:rounded-none md:border-l md:border-line md:px-6 md:py-8 md:shadow-none"
    >
      <span className="mx-auto h-1 w-10 rounded-full bg-line md:hidden" />
      {intro && <div className="hidden md:block">{intro}</div>}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Pickups ahead</h2>
        <span className="text-[13px] font-medium text-muted">{heading}</span>
      </div>

      {mode === "rest" || mode === "lost" ? (
        <p className="rounded-2xl bg-stage px-3.5 py-3.5 text-sm font-medium text-muted">{MESSAGES[mode]}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl bg-stage px-3.5 py-3.5 text-sm font-medium text-muted">No one is waiting ahead yet.</p>
      ) : (
        rows.map((pickup, i) => <PickupRow key={`${pickup.lat}-${pickup.lng}`} pickup={pickup} first={i === 0} />)
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-fault">
          {error}
        </p>
      )}

      <div className="flex gap-3 md:mt-auto md:flex-col">
        <ToggleCard
          title="At rest"
          hint="Parked, off duty"
          on={status === "AT_REST"}
          onChange={(on) => onStatus(on ? "AT_REST" : "IN_SERVICE")}
        />
        <ToggleCard
          title="Stopover"
          hint="Short stop"
          on={status === "STOPOVER"}
          onChange={(on) => onStatus(on ? "STOPOVER" : "IN_SERVICE")}
        />
      </div>
    </section>
  );
};

export default DriverSheet;
