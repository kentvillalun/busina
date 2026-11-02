import { z } from "zod";

// bcrypt only reads the first 72 bytes, so a longer password is refused instead of silently cut.
const loginSchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(72),
});

const busParamsSchema = z.object({ id: z.uuid() });

const activeSchema = z.object({ active: z.boolean() });

export { loginSchema, busParamsSchema, activeSchema };
