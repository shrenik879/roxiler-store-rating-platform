# Store Rating Platform

A full-stack web application that enables users to discover and rate stores on a 1–5 scale. Built with a layered MVC architecture, role-based access control, and JWT-based authentication — designed as a production-quality assessment submission.

---

## Live Demo

| | URL |
|---|---|
| 🌐 **Frontend** | https://store-rating-frontend.onrender.com |
| 🔌 **Backend API** | https://store-rating-backend.onrender.com |
| 📖 **API Docs (Swagger)** | https://store-rating-backend.onrender.com/api/docs |

---

## Features

### 👤 Normal User
- Register and log in securely
- Search and browse stores by name or address
- Submit a 1–5 star rating for any store
- Update a previously submitted rating
- View each store's average rating and personal rating

### 🏪 Store Owner
- View own store's average rating and total rating count
- See how many unique users have rated the store
- Browse the full list of raters with their individual scores

### 🛡️ Admin
- Overview dashboard with total users, stores, and ratings
- Ratings-over-time chart and user role distribution graph
- Recent activity feed
- Create users of any role; register and manage stores
- Search, sort, and paginate both user and store lists
- Export user and store data to CSV

### 🔐 Authentication & Security
- JWT access token (short-lived, 15 min) sent as Authorization header
- HttpOnly refresh token cookie (7-day, stored hashed in DB)
- Token rotation and revocation on password change
- Role-based route protection (Admin / Store Owner / User)
- Rate limiting on all API endpoints; stricter limits on auth routes
- Helmet security headers, CORS whitelisting, input validation via Joi

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│           React Frontend (Vite)              │
│  TanStack Query · React Hook Form · Recharts │
└─────────────────────┬────────────────────────┘
                      │ HTTPS  /api/*
┌─────────────────────▼────────────────────────┐
│         Node.js / Express Backend            │
│  Routes → Controllers → Services → Repos     │
│  Helmet · CORS · Rate Limiting · Swagger     │
└─────────────────────┬────────────────────────┘
                      │ Sequelize ORM
          ┌───────────▼───────────┐
          │     SQLite Database   │
          │  (Sequelize auto-sync)│
          └───────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 5, Tailwind CSS 3, TanStack Query, React Hook Form, Zod, Recharts, Framer Motion |
| **Backend** | Node.js 20, Express 4, Sequelize 6, Joi, Winston, Morgan, Swagger UI |
| **Database** | SQLite (via `sqlite3`); MySQL-compatible via `DB_DIALECT` switch |
| **Authentication** | JWT (access + refresh), bcrypt, httpOnly cookies |
| **Containerisation** | Docker (backend), Nginx (frontend static serving), Docker Compose |
| **Deployment** | Render (Docker Web Service + Static Site) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Docker (optional)

### Local Setup

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run seed    # creates DB + admin + demo data
npm run dev     # → http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev     # → http://localhost:5173
```

> The Vite dev server proxies `/api/*` to `localhost:5000` automatically — no extra configuration needed.

### Docker Setup

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/api/docs |

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@storerating.com` | `Admin@1234` |
| **Store Owner** | `owner1@storerating.com` | `Owner@123` |
| **Normal User** | `aarav@example.com` | `User@1234` |

---

## Project Structure

```
roxiler-store-rating-platform/
├── backend/                  # Node.js API (Express + Sequelize + SQLite)
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── config/           # env, db, logger, swagger
│       ├── routes/           # one router per resource
│       ├── controllers/      # request → service → response
│       ├── services/         # business logic + optional Redis caching
│       ├── repositories/     # all Sequelize queries
│       ├── models/           # User, Store, Rating, ActivityLog, RefreshToken
│       ├── middlewares/      # auth, RBAC, rate-limit, error handler
│       └── seed/             # idempotent seed script
├── frontend/                 # React app (Vite + Tailwind)
│   ├── Dockerfile
│   └── src/
│       ├── pages/            # Admin, User, Owner, Login, Signup
│       ├── components/       # tables, modals, charts, forms
│       ├── services/         # Axios client + API layer
│       └── contexts/         # auth state
├── docker-compose.yml        # local full-stack setup
└── render.yaml               # Render Blueprint (one-click deploy)
```

---

## Screenshots

> *Screenshots will be added after the live deployment is verified.*

| Screen | Description |
|---|---|
| **Login** | Role-based redirect after JWT auth |
| **Admin Dashboard** | KPI counters, ratings chart, activity feed |
| **Store List** | Searchable, sortable, paginated, CSV export |
| **Rate a Store** | Star rating with live average update |
| **Owner Dashboard** | Rating analytics for the owner's store |
