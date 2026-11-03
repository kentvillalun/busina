import { DIRECTION_WORDS } from "./direction.js";

// What the driver screen is showing: "live" (in service with a fresh position), "rest" (At rest), "stopover", or "lost"
// (in service but no fresh position). The driver's own choice wins over the signal.
export const driverMode = (data) => {
  const { serviceStatus } = data.bus;
  if (serviceStatus === "AT_REST") return "rest";
  if (serviceStatus === "STOPOVER") return "stopover";
  return !data.position || data.position.stale ? "lost" : "live";
};

// The words of each mode (Figma D2 to D5). `banner` is the message about what commuters see.
export const MODE_COPY = {
  live: { line: "In service. Commuters can see you.", banner: null },
  rest: { line: "At rest. Hidden from commuters.", banner: "Commuters cannot see this bus or its ETA." },
  stopover: { line: "On stopover. Commuters see no ETA.", banner: 'Commuters see "Stopped". Turn Stopover off when you leave.' },
  lost: { line: "No signal from the bus device.", banner: "Commuters see your last position, marked stale." },
};

export const DIRECTION_LABEL = {
  NORTHBOUND: `${DIRECTION_WORDS.NORTHBOUND.title}, ${DIRECTION_WORDS.NORTHBOUND.hint}`,
  SOUTHBOUND: `${DIRECTION_WORDS.SOUTHBOUND.title}, ${DIRECTION_WORDS.SOUTHBOUND.hint}`,
};
