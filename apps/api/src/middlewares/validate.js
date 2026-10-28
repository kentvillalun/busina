// On failure the ZodError goes to errorHandler (400). On success req.body is replaced by the
// parsed data, so unknown fields are dropped.
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;
    next();
  };
};

export { validate };
