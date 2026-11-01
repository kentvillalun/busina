import { z } from "zod";
import { endpoint } from "./push.schema.js";

// Logout may carry the push endpoint of the browser that is signing out, so its subscription is removed with the session.
// The body is optional (a plain POST with no body is fine), hence the two optionals.
const logoutSchema = z.object({ endpoint: endpoint.optional() }).optional();

export { logoutSchema };
