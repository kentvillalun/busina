// `code` is a stable name the mobile app can switch on; the message may change.
const DEFAULT_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_ERROR",
  501: "NOT_IMPLEMENTED",
};

class HttpError extends Error {
  constructor(status, message, { code, details } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code ?? DEFAULT_CODES[status] ?? "ERROR";
    this.details = details;
  }
}

export { HttpError };
