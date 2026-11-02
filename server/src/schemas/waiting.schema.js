import { z } from "zod";

// Where the commuter waits (their boarding spot or their GPS at the moment they agreed) and which way they ride.
const shareSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  direction: z.enum(["NORTHBOUND", "SOUTHBOUND"]),
});

export { shareSchema };
