# Finance Dashboard — Backend API

A production-ready REST API for a Finance Dashboard application built with Node.js, Express, and MongoDB. Demonstrates clean architecture, role-based access control, business logic clarity, and meaningful data aggregation.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Runtime      | Node.js 18+                   |
| Framework    | Express.js 4                  |
| Database     | MongoDB + Mongoose 8           |
| Auth         | JSON Web Tokens (JWT)         |
| Hashing      | bcryptjs                      |
| Validation   | Joi                           |
| Security     | Helmet, CORS                  |

---

## Folder Structure

```
finance-dashboard-backend/
│
├── app.js                    # App entry point — wires middleware, routes, DB
│
├── config/
│   └── db.js                 # MongoDB connection logic
│
├── constants/
│   └── index.js              # App-wide enums: roles, status, categories, types
│
├── controllers/
│   ├── authController.js     # Register, login, get profile
│   ├── userController.js     # Admin user management
│   ├── recordController.js   # Financial record CRUD
│   └── dashboardController.js# Aggregation endpoints
│
├── middleware/
│   ├── authMiddleware.js     # JWT verification + inactive user check
│   ├── roleMiddleware.js     # Role-based access control (allowRoles factory)
│   ├── requestLogger.js      # HTTP request logging
│   └── errorHandler.js       # Global error handler (Mongoose, JWT, generic)
│
├── models/
│   ├── User.js               # User schema (role, status, password hashing)
│   └── Record.js             # Financial record schema (soft delete, indexes)
│
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── userRoutes.js         # /api/users (admin only)
│   ├── recordRoutes.js       # /api/records
│   └── dashboardRoutes.js    # /api/dashboard
│
├── services/
│   ├── authService.js        # Register/login business logic
│   ├── userService.js        # User CRUD business logic
│   ├── recordService.js      # Record CRUD + filter/sort/paginate
│   └── dashboardService.js   # MongoDB aggregation pipelines
│
├── validators/
│   └── index.js              # Joi schemas + validate() middleware factory
│
├── utils/
│   ├── apiResponse.js        # Standardised success/error response shapes
│   ├── logger.js             # Timestamped console logger
│   └── pagination.js         # parsePagination() + buildMeta()
│
├── scripts/
│   └── seed.js               # Seed script: 3 users + 60 records
│
├── .env.example
├── .gitignore
└── package.json
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

### 2. Clone & Install

```bash
git clone <repo-url>
cd finance-dashboard-backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 4. Seed the Database (Optional but Recommended)

```bash
npm run seed
```

This creates:
- **admin@example.com** / `admin123` — full access
- **analyst@example.com** / `analyst123` — read + analytics
- **viewer@example.com** / `viewer123` — read-only
- 60 randomised financial records spread across the last 12 months

### 5. Start the Server

```bash
# Development (auto-restart on change)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## Environment Variables

| Variable         | Description                              | Default                                    |
|------------------|------------------------------------------|--------------------------------------------|
| `PORT`           | Server port                              | `5000`                                     |
| `NODE_ENV`       | Environment (`development`/`production`) | `development`                              |
| `MONGO_URI`      | MongoDB connection string                | `mongodb://localhost:27017/finance-dashboard` |
| `JWT_SECRET`     | JWT signing secret (keep long & random)  | —                                          |
| `JWT_EXPIRES_IN` | Token expiry duration                    | `7d`                                       |
| `CLIENT_URL`     | Allowed CORS origin                      | `*`                                        |

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

### Auth Routes

#### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "viewer"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "viewer", "status": "active" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```
POST /api/auth/login
```

<!-- POST /auth/register
POST /auth/login
Users (Admin only)
GET /users
PATCH /users/:id/status
Records
POST /records
GET /records
PUT /records/:id
DELETE /records/:id
Dashboard
GET /dashboard/summary
GET /dashboard/trends -->
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "_id": "...", "name": "Admin User", "role": "admin", "status": "active" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get My Profile
```
GET /api/auth/me
Authorization: Bearer <token>
```

---

### User Routes *(Admin only)*

#### List All Users
```
GET /api/users?role=analyst&status=active&page=1&limit=10
```

#### Get User by ID
```
GET /api/users/:id
```

#### Update User Role / Status
```
PATCH /api/users/:id
```
**Body (at least one field required):**
```json
{
  "role": "analyst",
  "status": "inactive"
}
```

---

### Record Routes

#### List Records *(All authenticated roles)*
```
GET /api/records
```
**Query Parameters:**

| Param       | Description                              | Example               |
|-------------|------------------------------------------|-----------------------|
| `type`      | Filter by type                           | `income` or `expense` |
| `category`  | Filter by category                       | `salary`, `rent`, ... |
| `startDate` | Date range lower bound (ISO 8601)        | `2024-01-01`          |
| `endDate`   | Date range upper bound (ISO 8601)        | `2024-12-31`          |
| `search`    | Substring search in notes                | `invoice`             |
| `page`      | Page number (default: 1)                 | `2`                   |
| `limit`     | Records per page (default: 10, max: 100) | `20`                  |
| `sortBy`    | Sort field                               | `date` or `amount`    |
| `order`     | Sort direction                           | `asc` or `desc`       |

**Response:**
```json
{
  "success": true,
  "data": [ { "_id": "...", "amount": 5000, "type": "income", "category": "salary", ... } ],
  "meta": {
    "total": 60,
    "page": 1,
    "limit": 10,
    "totalPages": 6,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Get Record by ID *(All authenticated roles)*
```
GET /api/records/:id
```

#### Create Record *(Admin only)*
```
POST /api/records
```
**Body:**
```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "salary",
  "date": "2024-03-15",
  "notes": "March salary"
}
```

#### Update Record *(Admin only)*
```
PATCH /api/records/:id
```
**Body (partial updates allowed):**
```json
{
  "amount": 5500.00,
  "notes": "Updated March salary"
}
```

#### Delete Record *(Admin only — soft delete)*
```
DELETE /api/records/:id
```

---

### Dashboard Routes *(Analyst + Admin)*

#### Full Dashboard (all insights in one request)
```
GET /api/dashboard
```
**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 42500.00,
      "totalExpenses": 18200.00,
      "netBalance": 24300.00,
      "incomeCount": 30,
      "expenseCount": 30
    },
    "categoryBreakdown": {
      "income": [
        { "category": "salary", "total": 30000, "count": 6 },
        { "category": "freelance", "total": 8500, "count": 5 }
      ],
      "expense": [
        { "category": "rent", "total": 9600, "count": 4 },
        { "category": "food", "total": 3200, "count": 12 }
      ]
    },
    "monthlyTrends": [
      { "month": "2024-01", "income": 4000, "expense": 1800, "incomeCount": 3, "expenseCount": 5 },
      { "month": "2024-02", "income": 3500, "expense": 1200 }
    ],
    "recentTransactions": [
      { "_id": "...", "amount": 2500, "type": "income", "category": "freelance", "date": "2024-03-20" }
    ]
  }
}
```

#### Summary Only
```
GET /api/dashboard/summary
```

#### Category Breakdown
```
GET /api/dashboard/categories
```

#### Monthly Trends (last 12 months)
```
GET /api/dashboard/trends
```

#### Recent Transactions (last 5)
```
GET /api/dashboard/recent
```

---

### Error Responses

All errors follow the same shape:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": ["field-level detail 1", "field-level detail 2"]
}
```

| Status | Meaning                              |
|--------|--------------------------------------|
| 400    | Validation error / bad request       |
| 401    | Missing or invalid/expired JWT       |
| 403    | Authenticated but insufficient role  |
| 404    | Resource not found                   |
| 409    | Conflict (e.g., duplicate email)     |
| 500    | Internal server error                |

---

## Role-Based Access Summary

| Endpoint                  | Viewer | Analyst | Admin |
|---------------------------|--------|---------|-------|
| POST /auth/register       | Yes     | Yes     | Yes    |
| POST /auth/login          | Yes     | Yes      | Yes    |
| GET  /auth/me             | Yes     | Yes      | Yes    |
| GET  /records             | Yes     | Yes      | Yes    |
| GET  /records/:id         | Yes     | Yes      | Yes    |
| POST /records             |  No     |  No      | Yes    |
| PATCH /records/:id        |  No     |  No      | Yes    |
| DELETE /records/:id       |  No     |  No      | Yes    |
| GET  /dashboard/*         |  No     | Yes      | Yes    |
| GET  /users               |  No     |  No      | Yes    |
| PATCH /users/:id          |  No     |  No      | Yes    |

---

## Example curl Requests

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. Create a record (replace TOKEN)
curl -X POST http://localhost:5000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":5000,"type":"income","category":"salary","date":"2024-03-01","notes":"March salary"}'

# 3. List records with filters
curl "http://localhost:5000/api/records?type=expense&category=food&page=1&limit=5" \
  -H "Authorization: Bearer TOKEN"

# 4. Get full dashboard
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer TOKEN"

# 5. Deactivate a user (admin only)
curl -X PATCH http://localhost:5000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"status":"inactive"}'
```

---

## Design Decisions & Assumptions

### Why RBAC (Role-Based Access Control)?

Financial data has different stakeholders with different needs and risks:

- **Viewers** need transparency without mutation risk. A viewer accidentally (or maliciously) deleting a record would corrupt audit history.
- **Analysts** are decision-support roles — they need computed insights but not the ability to manipulate the underlying data.
- **Admins** are accountable for data integrity, so write operations are restricted to them.

Enforcing RBAC at the **middleware layer** (not inside business logic) means the rule is applied consistently to every route without repeating the check in controllers or services.

### Why MongoDB Aggregation for Dashboard?

Two reasons — correctness and scale:

1. **Scale**: Financial databases grow large. Loading thousands of records into Node.js memory to sum them is slow and wasteful. MongoDB's aggregation engine runs natively in C++ on the DB server and only returns the computed result.
2. **Correctness**: Aggregation pipelines make the computation intent explicit and auditable. `$group` + `$sum` is harder to get wrong than a JavaScript `.reduce()`.

All aggregations run in parallel via `Promise.all()` — the dashboard endpoint is as fast as its slowest individual query, not the sum of all queries.

### Why Soft Delete?

Financial records are referenced in aggregations, audit trails, and the `createdBy` chain. Hard-deleting a record would:
- Corrupt historical dashboard data (net balance suddenly changes)
- Break `createdBy` references on other documents
- Violate accounting best practices (deleted != never existed)

Soft delete sets `isDeleted: true` and records `deletedAt` / `deletedBy`. A Mongoose pre-find hook automatically excludes soft-deleted records from all queries, so no calling code needs to remember to filter them.

### Assumptions

1. A single deployment serves one organisation (multi-tenancy is not scoped in).
2. Amounts are stored as plain numbers. For production financial systems, consider storing as integers (cents) to avoid floating-point rounding errors.
3. The `role` field on `/auth/register` is accepted for seeding convenience. In a real product, new users would always start as `viewer` and admins would promote them via the users API.
4. Pagination max limit is capped at 100 to prevent accidental full-table scans via the API.
