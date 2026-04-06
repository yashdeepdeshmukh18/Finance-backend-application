//  Role Definitions 
// Roles are hierarchical in terms of access but explicitly checked per route.
// viewer  → read-only (view records, dashboard summaries)
// analyst → viewer + analytics/dashboard access
// admin   → full CRUD on users and records

const ROLES = {
  VIEWER: "viewer",
  ANALYST: "analyst",
  ADMIN: "admin",
};

//  User Status 
const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

//  Record Types 
const RECORD_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

//  Record Categories 
const RECORD_CATEGORIES = [
  "salary",
  "investment",
  "business",
  "freelance",
  "food",
  "transport",
  "utilities",
  "healthcare",
  "entertainment",
  "education",
  "rent",
  "insurance",
  "other",
];

//  Pagination Defaults 
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  USER_STATUS,
  RECORD_TYPES,
  RECORD_CATEGORIES,
  PAGINATION,
};
