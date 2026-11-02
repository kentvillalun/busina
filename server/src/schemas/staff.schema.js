import { z } from "zod";

// The PIN is digits only so the keypad on a phone is enough; it is never echoed back or logged.
const loginSchema = z.object({
  busNumber: z.string().trim().min(1).max(20),
  pin: z.string().regex(/^\d{4,8}$/, "The PIN is 4 to 8 digits"),
});

export { loginSchema };
