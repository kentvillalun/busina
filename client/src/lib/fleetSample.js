// Sample fleet for the operator Overview, Buses and Staff screens (Figma OP2 to OP8). The shape is what GET /operator/fleet
// will return, so wiring the real data later means replacing these imports, not the screens. `progress` (0 to 1 along the road)
// only places the sample pins on the map.

export const STATUS = {
  live: { label: "Live", look: "bg-stage text-navy" },
  stopover: { label: "Stopover", look: "bg-stage text-navy" },
  at_rest: { label: "At rest", look: "bg-uncertain-bg text-uncertain" },
  stale: { label: "Signal lost", look: "bg-uncertain-bg text-fault" },
  no_signal: { label: "No signal yet", look: "bg-uncertain-bg text-uncertain" },
};

export const ROUTE_NAME = "Laoag – Vigan";

// Southbound runs from Laoag to Vigan.
export const routeText = (direction) => (direction === "south" ? "Laoag to Vigan" : "Vigan to Laoag");

export const NEEDS_ATTENTION = ["stale", "no_signal"];

export const FLEET = [
  { id: "b1", busNumber: "0015", name: "Ilocos Express", direction: "south", status: "live", seatsFree: 9, seatCount: 40, speedKmh: 52, lastUpdate: "3s ago", progress: 0.3 },
  { id: "b2", busNumber: "0021", name: "Vigan Liner", direction: "north", status: "live", seatsFree: 21, seatCount: 40, speedKmh: 47, lastUpdate: "5s ago", progress: 0.62 },
  { id: "b3", busNumber: "0033", name: "Laoag Star", direction: "south", status: "stale", seatsFree: null, seatCount: 40, speedKmh: null, lastUpdate: "4 min ago", progress: 0.46 },
  { id: "b4", busNumber: "0047", name: "Bangui Shuttle", direction: "north", status: "stopover", seatsFree: 14, seatCount: 40, speedKmh: 0, lastUpdate: "8s ago", progress: 0.8 },
  { id: "b5", busNumber: "0052", name: "Pagudpud Rider", direction: "south", status: "at_rest", seatsFree: 40, seatCount: 40, speedKmh: 0, lastUpdate: "12 min ago", progress: 0.05 },
  { id: "b6", busNumber: "0068", name: "Sinait Mini", direction: "north", status: "no_signal", seatsFree: null, seatCount: 40, speedKmh: null, lastUpdate: "Never", progress: null },
];

export const STAFF = [
  { id: "s1", name: "Juan Dela Cruz", role: "DRIVER", active: true, busId: "b1" },
  { id: "s2", name: "Ana Reyes", role: "CONDUCTOR", active: true, busId: "b1" },
  { id: "s3", name: "Mario Santos", role: "DRIVER", active: true, busId: "b2" },
  { id: "s4", name: "Pedro Ramos", role: "DRIVER", active: true, busId: "b3" },
  { id: "s5", name: "Liza Bautista", role: "CONDUCTOR", active: true, busId: "b5" },
  { id: "s6", name: "Carlo Mendoza", role: "DRIVER", active: true, busId: null },
  { id: "s7", name: "Rita Flores", role: "CONDUCTOR", active: false, busId: null },
];

// "Juan Dela Cruz +1" for the table, "Not assigned" when nobody works on the bus.
export const crewText = (busId, staff = STAFF) => {
  const crew = staff.filter((person) => person.busId === busId);
  if (crew.length === 0) return "Not assigned";
  return crew.length === 1 ? crew[0].name : `${crew[0].name} +${crew.length - 1}`;
};
