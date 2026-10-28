import { HttpError } from "../utils/HttpError.js";

// Stub for the login slice (drivers, conductors, operators). Devices use deviceAuth instead.
// TODO: verify the Bearer JWT, load the user, set req.user = { id, role, companyId }.
const authenticate = async (req, res, next) => {
  return next(new HttpError(501, "Authentication is not implemented yet"));
};

// requireRoles(["DRIVER", "CONDUCTOR"]); must run after authenticate, which sets req.user.
const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to do this"));
    }

    next();
  };
};

export { authenticate, requireRoles };
