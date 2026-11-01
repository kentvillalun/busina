import { z } from "zod";

// `endpoint` and `keys` are exactly what the browser's subscription.toJSON() gives, so the client can spread it.
// Push services only use https; refusing anything else also stops the server from posting to arbitrary http hosts.
const endpoint = z
  .url()
  .max(2048)
  .refine((value) => value.startsWith("https://"), "endpoint must be https");

const subscribeSchema = z.object({
  endpoint,
  keys: z.object({
    p256dh: z.string().min(1).max(256),
    auth: z.string().min(1).max(64),
  }),
  spot: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  alertMinutes: z.number().int().min(1).max(60),
  direction: z.enum(["NORTHBOUND", "SOUTHBOUND"]),
  targetBusId: z.uuid().nullish(), // null/absent = any bus going `direction`
});

const unsubscribeSchema = z.object({ endpoint });

export { endpoint, subscribeSchema, unsubscribeSchema };
