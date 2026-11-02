// How the operator screens show a bus. `status` comes from GET /api/operator/fleet.

export const STATUS = {
  live: { label: "Live", look: "bg-stage text-navy" },
  stopover: { label: "Stopover", look: "bg-stage text-navy" },
  at_rest: { label: "At rest", look: "bg-uncertain-bg text-uncertain" },
  stale: { label: "Signal lost", look: "bg-uncertain-bg text-fault" },
  no_signal: { label: "No signal yet", look: "bg-uncertain-bg text-uncertain" },
  disabled: { label: "Disabled", look: "bg-uncertain-bg text-uncertain" },
};

export const NEEDS_ATTENTION = ["stale", "no_signal"];

// shortcut: the two ends are written for the demo route (Laoag - Vigan); a second route needs the names from the route itself.
export const routeText = (direction) => {
  if (direction === "SOUTHBOUND") return "Laoag to Vigan";
  if (direction === "NORTHBOUND") return "Vigan to Laoag";
  return "—";
};

export const seatsText = (bus) => (bus.seatsFree === null ? "Unknown" : `${bus.seatsFree} / ${bus.seatCount}`);
