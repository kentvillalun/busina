import Link from "next/link";
import IconChevron from "@/components/icons/IconChevron";
import { haptic, hapticTrigger } from "@/lib/haptics";
import { ago } from "@/lib/time";

// Figma S1b. `selected` is the highlighted card. With `onSelect`, tapping the card shows the bus on
// the map (a button stretched over the card); "View details" is its own link on top of that.
const BusCard = ({ bus, serverTime, selected, onSelect, locationOff = false, className = "" }) => {
  const { state, stale } = bus;

  let seatsText = `${state.seatsFree} of ${bus.seatCount} seats free`;
  let seatsColor = "text-success";
  if (state.seatsFree === 0) {
    seatsText = `Full, ${state.standing} standing`;
    seatsColor = "text-muted";
  }
  if (stale) {
    seatsText = "Seats unavailable";
    seatsColor = "text-uncertain";
  }

  // The API has no ETA yet (FR8), so a live bus can have none.
  const hasEta = !stale && !locationOff && bus.etaMin != null;
  let etaText = "-";
  let etaNote = "ETA coming soon";
  if (stale) etaNote = "no live ETA";
  else if (locationOff) etaNote = "location off";
  if (hasEta) {
    etaText = `${bus.etaMin} min`;
    etaNote = "to your spot";
  }

  return (
    <div
      className={`relative flex flex-col gap-2.5 rounded-2xl p-3.5 ${
        selected ? "border-[1.5px] border-primary bg-stage" : "border border-line bg-white"
      } ${className}`}
    >
      {onSelect && (
        <button
          type="button"
          ref={hapticTrigger}
          onClick={() => {
            haptic.light();
            onSelect();
          }}
          aria-label={`Show bus ${bus.busNumber} on the map`}
          className="absolute inset-0 rounded-2xl active:bg-ink/5"
        />
      )}

      <div className="pointer-events-none relative flex items-center gap-3">
        <span
          className={`min-w-13.5 rounded-[10px] px-2.5 py-2 text-center font-display text-lg ${
            stale ? "border border-line bg-uncertain-bg text-uncertain" : "bg-primary text-white"
          }`}
        >
          {bus.busNumber}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[15px] font-semibold text-ink">{bus.name}</span>
          <span className={`text-[13px] font-medium ${seatsColor}`}>{seatsText}</span>
        </div>

        <div className="flex flex-col items-end">
          <span className={`font-display text-[22px] ${hasEta ? "text-navy" : "text-uncertain"}`}>
            {etaText}
          </span>
          <span className="text-[11px] text-muted">{etaNote}</span>
        </div>
      </div>

      <div className="pointer-events-none relative flex items-center justify-between gap-2">
        <p className={`text-xs ${stale ? "text-uncertain" : "text-muted"}`}>
          {stale
            ? `Signal lost · last seen ~${ago(serverTime, state.lastPingAt)}`
            : `~${state.onBoard} on board (est.) · Live ${ago(serverTime, state.lastPingAt)}`}
        </p>
        {onSelect && (
          <Link
            href={`/bus/${bus.id}`}
            ref={hapticTrigger}
            onClick={haptic.light}
            className="pointer-events-auto -my-2 flex shrink-0 items-center gap-0.5 py-2 pl-2 text-xs font-bold text-primary active:opacity-60"
          >
            View details
            <IconChevron className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default BusCard;
