# Store Rating Platform

A web app where users can rate stores from 1 to 5. There are three kinds of
users - a system admin, normal users, and store owners - and each gets their own
set of pages after logging in.

Built with an Express + MySQL backend and a React (Vite) frontend.

## Stack

**Backend:** Node.js, Express, Sequelize, MySQL, Redis, JWT, Joi, Swagger
**Frontend:** React 19, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts

The backend can run on SQLite instead of MySQL (set `DB_DIALECT=sqlite`), which
is handy for running locally without setting up a database server. Redis is
optional too - if it isn't reachable the app just reads straight from the DB.

## Running it

You need Node 18+. Docker is optional.

### Locally

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

This starts the API on http://localhost:5000 and creates the admin account plus
some demo data.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

### With Docker

Brings up MySQL, Redis, the API and the frontend together:

```bash
docker compose up --build
```

Frontend on http://localhost:8080, API on http://localhost:5000.

## Login details

| Role        | Email                  | Password   |
|-------------|------------------------|------------|
| Admin       | admin@storerating.com  | Admin@1234 |
| Store Owner | owner1@storerating.com | Owner@123  |
| Normal User | aarav@example.com       | User@1234  |

There are a few more demo users (priya@, rohan@, sneha@ - all `User@1234`).

## What each role can do

**Admin** - sees a dashboard with the total counts, a ratings-over-time chart, a
breakdown of users by role, and a recent activity feed. Can add users of any
role, register stores, and browse/search/sort both lists. Both lists can be
exported to CSV.

**Normal user** - signs up, searches stores by name or address, and gives each
store a rating from 1 to 5 (or changes it later). Each store shows its average
rating and the rating you gave it.

**Store owner** - sees their store's average rating, how many ratings it has,
how many unique people rated it, and the full list of who rated it.

Everyone can change their own password from the menu in the top right.

## Project layout

```
backend/
  src/
    config/        env, db, redis, logger, swagger setup
    routes/        express routers (one file per resource)
    controllers/   request handling, calls into services
    services/      business logic + caching
    repositories/  database queries (Sequelize)
    models/        User, Store, Rating, ActivityLog, RefreshToken
    middlewares/   auth, role check, validation, error handler, rate limit
    validations/   Joi schemas
    utils/         jwt, password hashing, pagination, csv, etc.
    seed/          seed script
  tests/           Jest tests for the services

frontend/
  src/
    pages/         login, signup, admin, user and owner screens
    components/     buttons, tables, modals, charts, etc.
    layouts/        sidebar + topbar shell, auth layout
    routes/         protected and role-based routing
    services/       axios setup + api calls
    hooks/          debounce, csv download
    contexts/       auth state
    validations/    zod schemas
    constants, utils
```

## A few notes on how it works

I split the backend into controllers, services and repositories so the actual
business logic stays out of the route handlers and the database queries live in
one place. Controllers just read the request and send the response, services do
the work, repositories talk to Sequelize.

Auth uses two tokens: a short-lived access token sent on each request, and a
longer refresh token kept in an httpOnly cookie. The refresh token is stored
(hashed) in the database so it can be rotated and revoked - changing your
password, for example, invalidates all existing sessions.

A user can only rate a store once. That's a unique index on
`(user_id, store_id)`; trying to rate twice returns a 409 and the frontend turns
that into an update instead.

The admin dashboard and store lists are cached in Redis (cache-aside) and the
cache is cleared whenever the underlying data changes.

The API is documented with Swagger at http://localhost:5000/api/docs.

## Environment variables

Everything is in `backend/.env.example`. The defaults run on SQLite without
Redis, so you can usually just copy it and go. Switch `DB_DIALECT` to `mysql`
and fill in the `DB_*` values to use MySQL. Set real `JWT_*` secrets before
deploying anywhere.

## Tests

```bash
cd backend
npm test
```

Covers the auth and rating services - registration, login, duplicate handling,
password changes, refresh-token rotation, and the rate submit/update/conflict
flow - against an in-memory SQLite database.
