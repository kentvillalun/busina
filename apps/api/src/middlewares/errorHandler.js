import { ZodError } from "zod";
import { HttpError } from "../utils/HttpError.js";

// Every error response is { "error": { "code", "message", "details?" } }.

const notFound = (req, res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Express recognises an error handler by its four arguments. Register it last.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong";
  let details;

  if (err instanceof HttpError) {
    ({ status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "The request body is invalid";
    details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    code = "INVALID_JSON";
    message = "The request body is not valid JSON";
  } else if (err.type === "entity.too.large") {
    status = 413;
    code = "PAYLOAD_TOO_LARGE";
    message = "The request body is too large";
  }

  // The client only gets the generic message; the full error stays in the server log.
  if (status >= 500) {
    console.error("Unhandled error:", err);
  }

  return res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
};

export { notFound, errorHandler };
