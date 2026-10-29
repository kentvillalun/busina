const makeSeats = (occupied) => Array.from({ length: 40 }, (_, i) => (i < occupied ? 1 : 0));

// MOCK: same shape as GET /buses, so swapping it for the real response changes nothing else.
// `etaMin` is mock only: FR8 will compute the real ETA.
const MOCK_BUSES = {
  serverTime: "2026-10-30T02:00:00.000Z",
  buses: [
    {
      id: "b1",
      busNumber: "214",
      etaMin: 4,
      name: "Sample Line Express",
      seatCount: 40,
      stale: false,
      state: {
        direction: "NORTHBOUND",
        lat: 18.1985,
        lng: 120.5925,
        seats: makeSeats(31),
        occupied: 31,
        seatsFree: 9,
        onBoard: 31,
        standing: 0,
        lastPingAt: "2026-10-30T01:59:52.000Z",
      },
    },
    {
      id: "b2",
      busNumber: "087",
      name: "Sample Line Ordinary",
      seatCount: 40,
      stale: true,
      state: {
        direction: "NORTHBOUND",
        lat: 18.1978,
        lng: 120.5931,
        seats: makeSeats(18),
        occupied: 18,
        seatsFree: 22,
        onBoard: 18,
        standing: 0,
        lastPingAt: "2026-10-30T01:56:40.000Z",
      },
    },
    {
      id: "b3",
      busNumber: "305",
      etaMin: 31,
      name: "Sample Line Aircon",
      seatCount: 40,
      stale: false,
      state: {
        direction: "NORTHBOUND",
        lat: 18.204,
        lng: 120.595,
        seats: makeSeats(40),
        occupied: 40,
        seatsFree: 0,
        onBoard: 46,
        standing: 6,
        lastPingAt: "2026-10-30T01:59:57.000Z",
      },
    },
    {
      id: "b4",
      busNumber: "112",
      etaMin: 22,
      name: "Sample Line Express",
      seatCount: 40,
      stale: false,
      state: {
        direction: "SOUTHBOUND",
        lat: 18.195,
        lng: 120.592,
        seats: makeSeats(12),
        occupied: 12,
        seatsFree: 28,
        onBoard: 12,
        standing: 0,
        lastPingAt: "2026-10-30T01:59:50.000Z",
      },
    },
  ],
};

export { MOCK_BUSES };
