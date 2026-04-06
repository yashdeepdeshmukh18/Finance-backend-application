const { PAGINATION } = require("../constants");

/**
 * Parses page/limit from query params with safe defaults and caps.
 * Returns values suitable for Mongoose .skip() and .limit().
 */
const parsePagination = (query) => {
  let page = parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;

  // Clamp to valid range
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds the meta block returned with paginated responses.
 */
const buildMeta = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { parsePagination, buildMeta };
