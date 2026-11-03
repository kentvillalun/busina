// How the operator screens show a bus. `status` comes from GET /api/operator/fleet.
import { DIRECTION_WORDS } from "./direction.js";

export const STATUS = {
  live: { label: "Live", look: "bg-stage text-navy" },
  stopover: { label: "Stopover", look: "bg-stage text-navy" },
  at_rest: { label: "At rest", look: "bg-uncertain-bg text-uncertain" },
  stale: { label: "Signal lost", look: "bg-uncertain-bg text-fault" },
  no_signal: { label: "No signal yet", look: "bg-uncertain-bg text-uncertain" },
  disabled: { label: "Disabled", look: "bg-uncertain-bg text-uncertain" },
};

// The three messages of a bus list: a main line and a smaller line that says more (Figma-free copy, same shape as Ecoaid's).
export const BUS_LABELS = {
  loading: ["Loading buses", "We are fetching the buses of your company."],
  empty: ["No buses yet", "No bus is registered to your company yet. Registered buses will show up here."],
  error: ["Could not load the buses", "Check your connection, then try again."],
};

export const NEEDS_ATTENTION = ["stale", "no_signal"];

export const routeText = (direction) => DIRECTION_WORDS[direction]?.title ?? "—";

export const seatsText = (bus) => (bus.seatsFree === null ? "Unknown" : `${bus.seatsFree} / ${bus.seatCount}`);

// "Juan Dela Cruz +1" for the table, "Not assigned" when nobody works on the bus (crew is [{ name, role }]).
export const crewText = (bus) => (bus.crew.length === 0 ? "Not assigned" : bus.crew.length === 1 ? bus.crew[0].name : `${bus.crew[0].name} +${bus.crew.length - 1}`);
