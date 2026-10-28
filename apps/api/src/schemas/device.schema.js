import { z } from "zod";

// seats.length must equal the bus's seatCount; the controller checks that because it needs the bus.
const pingSchema = z.object({
  deviceId: z.string().min(1).max(64),
  ts: z.number().int().positive().optional(), // device clock, unused: the server stamps lastPingAt
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).max(200),
  // A real ESP32 cannot know its heading; only the simulator sends this for now.
  direction: z.enum(["NORTHBOUND", "SOUTHBOUND"]).optional(),
  // 1 = taken, 0 = free
  seats: z.array(z.number().int().min(0).max(1)).max(100),
  doorIn: z.number().int().min(0),
  doorOut: z.number().int().min(0),
});

export { pingSchema };
