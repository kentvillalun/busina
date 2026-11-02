// Sample data for the Staff screen (Figma OP7 and OP8) until the roster exists in the database. The fleet itself is real now:
// see hooks/useFleet.js.

export const FLEET = [
  { id: "b1", busNumber: "0015", name: "Ilocos Express" },
  { id: "b2", busNumber: "0021", name: "Vigan Liner" },
  { id: "b3", busNumber: "0033", name: "Laoag Star" },
  { id: "b4", busNumber: "0047", name: "Bangui Shuttle" },
  { id: "b5", busNumber: "0052", name: "Pagudpud Rider" },
  { id: "b6", busNumber: "0068", name: "Sinait Mini" },
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
