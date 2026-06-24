# Store Rating Platform

A full-stack web application where users can discover stores and rate them on a scale of 1–5. Three distinct roles — **Admin**, **Store Owner**, and **Normal User** — each get a tailored dashboard and feature set.

**Live Demo (Render):**
- 🌐 Frontend: `https://store-rating-frontend.onrender.com`
- 🔌 Backend API: `https://store-rating-backend.onrender.com`
- 📖 API Docs (Swagger): `https://store-rating-backend.onrender.com/api/docs`

> ⚠️ Free-tier Render services spin down after 15 min of inactivity. First request after idle takes ~30 s.

---

## Features

| Role | Capabilities |
|---|---|
| **Admin** | Dashboard with counters, ratings-over-time chart, user-role breakdown, activity feed. Manage users (create any role), manage stores, export both lists to CSV. |
| **Store Owner** | View own store's average rating, total rating count, unique raters, full rater list. |
| **Normal User** | Sign up, search stores by name/address, submit or update a 1–5 rating, see per-store averages. |
| **All roles** | Change own password from the profile menu. JWT access + httpOnly refresh-token auth. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                       │
│                 React 19 + Vite + Tailwind CSS               │
│        TanStack Query · React Hook Form · Zod · Recharts     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS  (VITE_API_URL → /api/*)
┌──────────────────────────▼──────────────────────────────────┐
│                      BACKEND API                             │
│           Node.js 20 · Express · Helmet · CORS               │
│                                                              │
│  Routes → Controllers → Services → Repositories → Sequelize │
│                                                              │
│  Auth: JWT access token (15 min) + httpOnly refresh cookie   │
│  Docs: Swagger UI at /api/docs                               │
│  Cache: Redis (optional, graceful fallback to DB)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Sequelize ORM
          ┌────────────────▼────────────────┐
          │         SQLite (file-based)      │
          │   /app/data/data.sqlite          │
          │   (Render Persistent Disk)       │
          └─────────────────────────────────┘
```

### Backend Layer Breakdown

```
backend/src/
├── config/        env validation (Joi), Sequelize, Redis, logger, Swagger
├── routes/        one Express router per resource
├── controllers/   read request → call service → send response
├── services/      business logic + optional Redis cache-aside
├── repositories/  all Sequelize queries in one place
├── models/        User, Store, Rating, ActivityLog, RefreshToken
├── middlewares/   auth, RBAC, Joi validation, rate-limit, error handler
├── validations/   Joi schemas
├── utils/         JWT, bcrypt, pagination, CSV export, constants
└── seed/          idempotent seed script (findOrCreate)

tests/             Jest unit tests (auth + rating services)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 20, Express 4, Sequelize 6, SQLite3, JWT, Joi, Winston, Swagger |
| **Frontend** | React 19, Vite 5, Tailwind CSS 3, TanStack Query 5, React Hook Form 7, Zod, Recharts, Framer Motion |
| **Auth** | JWT access token (Bearer) + httpOnly refresh-token cookie (DB-stored, revocable) |
| **Cache** | Redis via ioredis (optional — disabled by default) |
| **Containerisation** | Docker (backend image), Nginx (frontend static serving) |

---

## Local Development Setup

### Prerequisites
- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Git

### 1 — Clone

```bash
git clone https://github.com/shrenik879/roxiler-store-rating-platform.git
cd roxiler-store-rating-platform
```

### 2 — Backend

```bash
cd backend
cp .env.example .env          # copy the template
# Edit .env if needed (defaults work out of the box with SQLite)
npm install
npm run seed                  # creates DB + admin + demo data
npm run dev                   # starts on http://localhost:5000
```

API docs: http://localhost:5000/api/docs

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:5173
```

Open http://localhost:5173 — the Vite proxy forwards `/api/*` to `localhost:5000` automatically.

---

## Docker Setup (Full Stack)

Runs the entire stack (backend + SQLite) via Docker Compose:

```bash
# From repo root
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/api/docs |

To stop:
```bash
docker compose down
```

---

## Environment Variables

All variables live in `backend/.env.example`. Copy it to `backend/.env` for local use.

### Backend Variables

| Variable | Default | Required on Render | Description |
|---|---|---|---|
| `NODE_ENV` | `development` | ✅ `production` | Runtime environment |
| `PORT` | `5000` | Auto-injected | Render injects `10000`; app reads `process.env.PORT` |
| `DB_DIALECT` | `sqlite` | ✅ `sqlite` | `sqlite` or `mysql` |
| `DB_STORAGE` | `../../data.sqlite` | ✅ `/app/data/data.sqlite` | **SQLite file path — must point to persistent disk on Render** |
| `JWT_ACCESS_SECRET` | dev placeholder | ✅ (generate) | Min 10 chars. `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | dev placeholder | ✅ (generate) | Different from access secret |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | ✅ `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | ✅ `7d` | Refresh token lifetime |
| `BCRYPT_SALT_ROUNDS` | `10` | ✅ `10` | Password hashing cost |
| `CORS_ORIGIN` | `http://localhost:5173` | ✅ frontend URL | Comma-separated allowed origins |
| `COOKIE_SECURE` | `false` | ✅ `true` | `true` when serving over HTTPS |
| `REDIS_ENABLED` | `false` | ✅ `false` | Set `false` — no Redis on Render free tier |
| `RATE_LIMIT_WINDOW_MS` | `900000` | ✅ `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `300` | ✅ `300` | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | `20` | ✅ `20` | Max auth requests per window |
| `SEED_DEMO` | `false` | ✅ `true` (for demo) | Seeds demo stores, owners, users, ratings |
| `ADMIN_NAME` | `System Administrator Account` | ✅ | Admin display name |
| `ADMIN_EMAIL` | `admin@storerating.com` | ✅ | Admin login email |
| `ADMIN_PASSWORD` | `Admin@1234` | ✅ (change!) | Admin password — **change in production** |
| `ADMIN_ADDRESS` | `Head Office, Admin Street, City` | ✅ | Admin address |

### Frontend Variables (build-time)

| Variable | Local | Render | Description |
|---|---|---|---|
| `VITE_API_URL` | *(empty — uses Vite proxy)* | `https://store-rating-backend.onrender.com` | Backend base URL baked into the JS bundle |

---

## Render Deployment

### One-Click via Blueprint (Fastest)

1. Push this repo to GitHub (already done if you're reading this)
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub account and select `roxiler-store-rating-platform`
4. Render detects `render.yaml` and shows **2 services**: `store-rating-backend` + `store-rating-frontend`
5. Review → **Apply**

Both services deploy simultaneously. URLs are assigned within ~3 minutes.

### Manual Setup (if Blueprint fails)

#### Backend — Web Service (Docker)

| Field | Value |
|---|---|
| Service type | Web Service |
| Language | Docker |
| Dockerfile path | `backend/Dockerfile` |
| Docker build context | `backend` |
| Health check path | `/api/docs` |
| Region | Oregon (or nearest) |
| Plan | Free |

**Persistent Disk:**

| Field | Value |
|---|---|
| Name | `sqlite-data` |
| Mount path | `/app/data` |
| Size | 1 GB |

**Environment Variables:**

```
NODE_ENV=production
DB_DIALECT=sqlite
DB_STORAGE=/app/data/data.sqlite
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=https://store-rating-frontend.onrender.com
COOKIE_SECURE=true
REDIS_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=20
SEED_DEMO=true
ADMIN_NAME=System Administrator Account
ADMIN_EMAIL=admin@storerating.com
ADMIN_PASSWORD=Admin@1234
ADMIN_ADDRESS=Head Office, Admin Street, City
```

#### Frontend — Static Site

| Field | Value |
|---|---|
| Service type | Static Site |
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |
| Rewrite rule | `/*` → `/index.html` |

**Environment Variable:**

```
VITE_API_URL=https://store-rating-backend.onrender.com
```

---

## Post-Deploy Verification

```bash
# 1. Swagger UI loads
curl -s https://store-rating-backend.onrender.com/api/docs | grep -i swagger

# 2. Login works
curl -s -X POST https://store-rating-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@storerating.com","password":"Admin@1234"}' \
  | python -m json.tool

# 3. Frontend loads
curl -s https://store-rating-frontend.onrender.com | grep -i "store rating"
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@storerating.com` | `Admin@1234` |
| **Store Owner** | `owner1@storerating.com` | `Owner@123` |
| **Store Owner** | `owner2@storerating.com` | `Owner@123` |
| **Normal User** | `aarav@example.com` | `User@1234` |
| **Normal User** | `priya@example.com` | `User@1234` |
| **Normal User** | `rohan@example.com` | `User@1234` |
| **Normal User** | `sneha@example.com` | `User@1234` |

> Credentials above are seeded when `SEED_DEMO=true`. Admin is always seeded.

---

## Running Tests

```bash
cd backend
npm test
```

Jest tests cover the auth service (registration, login, duplicate handling, password changes, refresh-token rotation) and the rating service (submit, update, conflict) against an in-memory SQLite database.

---

## Known Limitations — SQLite on Render Free Tier

| Limitation | Detail |
|---|---|
| **Persistent Disk** | Render free tier **does not** support persistent disks on web services (paid plans only, $7/month Starter). On free tier, the SQLite file resets on every deploy. The seed script runs on each start so demo data is restored automatically — suitable for evaluation. |
| **No concurrent writes** | SQLite is file-based; concurrent writes serialize. Fine for low-traffic demos; use PostgreSQL for production scale. |
| **Cold starts** | Free services sleep after 15 min idle. First request wakes the service (~30 s). Subsequent requests are instant. |
| **Single instance** | SQLite can't be shared across multiple Render instances. Fine for the free tier's single instance. |

---

## Project Structure

```
roxiler-store-rating-platform/
├── backend/
│   ├── Dockerfile           ← Production Docker image (node:20-alpine + sqlite3 build tools)
│   ├── .env.example         ← Complete environment variable template
│   ├── package.json
│   └── src/
│       ├── app.js           ← Express app (middleware stack)
│       ├── server.js        ← HTTP server + graceful shutdown
│       ├── config/          ← env, database, redis, logger, swagger
│       ├── routes/          ← Express routers
│       ├── controllers/     ← Request/response handling
│       ├── services/        ← Business logic + caching
│       ├── repositories/    ← Sequelize queries
│       ├── models/          ← User, Store, Rating, ActivityLog, RefreshToken
│       ├── middlewares/     ← Auth, RBAC, rate-limit, error handler
│       ├── validations/     ← Joi schemas
│       ├── utils/           ← JWT, bcrypt, pagination, CSV, constants
│       └── seed/            ← Idempotent seed script
├── frontend/
│   ├── Dockerfile           ← Multi-stage: Vite build → nginx static serve
│   ├── nginx.conf           ← Nginx config (API proxy for docker-compose)
│   ├── .env.example
│   └── src/
│       ├── pages/           ← Login, Signup, Admin, User, Owner screens
│       ├── components/      ← UI components (tables, modals, charts, buttons)
│       ├── layouts/         ← Sidebar + topbar shell
│       ├── routes/          ← Protected + role-based routing
│       ├── services/        ← Axios client + API calls
│       ├── hooks/           ← useDebouncedValue, useCSVDownload
│       ├── contexts/        ← Auth state
│       └── validations/     ← Zod schemas
├── docker-compose.yml       ← Local full-stack (MySQL + Redis + backend + frontend)
├── render.yaml              ← Render Blueprint (one-click deployment)
└── .gitignore
```

---

## Screenshots

> 📸 *Screenshots will be added after the first successful Render deployment.*

| Screen | Description |
|---|---|
| Login | JWT auth with role-based redirect |
| Admin Dashboard | Stats, chart, activity feed |
| Store List | Search, sort, paginate, export CSV |
| User — Rate Store | Star rating with live average |
| Owner Dashboard | Rating analytics for own store |
