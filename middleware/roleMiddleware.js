const { error } = require("../utils/apiResponse");

/**
 * allowRoles(...roles) — role-based access control middleware factory.
 *
 * Usage:  router.delete("/records/:id", authenticate, allowRoles("admin"), ...)
 *
 * WHY RBAC:
 *  A Finance Dashboard handles sensitive data. Different stakeholders need
 *  different access levels:
 *   - Viewers need read-only access for oversight without risk of data mutation.
 *   - Analysts need read + aggregation for reporting and decision support.
 *   - Admins are the only ones who should write/delete financial records to
 *     maintain data integrity and a clear audit trail.
 *
 *  Enforcing this at the middleware layer (not inside services/controllers)
 *  means the rule applies consistently regardless of how a route is called.
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Misconfigured route: allowRoles used without authenticate before it
      return error(res, { message: "Authentication required.", status: 401 });
    }

    if (!roles.includes(req.user.role)) {
      return error(res, {
        message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}.`,
        status: 403,
      });
    }

    next();
  };
};

module.exports = { allowRoles };
