/**
 * Standardised API response shapes.
 *
 * Every endpoint returns either success() or error().
 * Consistent shape makes client-side parsing predictable.
 *
 * Success: { success: true,  data, message, meta? }
 * Error:   { success: false, error, message }
 */

const success = (res, { data = null, message = "OK", meta = null, status = 200 } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

const error = (res, { message = "Something went wrong", status = 500, errors = null } = {}) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

module.exports = { success, error };
