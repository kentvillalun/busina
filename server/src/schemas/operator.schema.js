import { z } from "zod";

// bcrypt only reads the first 72 bytes, so a longer password is refused instead of silently cut.
const loginSchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(72),
});

const idParamsSchema = z.object({ id: z.uuid() });

const activeSchema = z.object({ active: z.boolean() });

// The staff roster: people who work on a bus, as records only (they do not sign in).
const personName = z.string().trim().min(1).max(40);
const staffRole = z.enum(["DRIVER", "CONDUCTOR"]);
const busId = z.uuid().nullable();

const createStaffSchema = z.object({ firstName: personName, lastName: personName, role: staffRole, busId: busId.default(null) });

const updateStaffSchema = z
  .object({ firstName: personName, lastName: personName, role: staffRole, busId, active: z.boolean() })
  .partial()
  .refine((changes) => Object.keys(changes).length > 0, "Nothing to change");

export { loginSchema, idParamsSchema, activeSchema, createStaffSchema, updateStaffSchema };
