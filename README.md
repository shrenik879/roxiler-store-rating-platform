# Store Rating Platform

A full-stack web application that enables users to discover and rate stores on a scale of 1–5. The platform supports three roles—Admin, Store Owner, and Normal User—and implements role-based access control, JWT authentication, and a layered MVC architecture.

---

## Live Demo

| Service                        | URL                                                         |
| ------------------------------ | ----------------------------------------------------------- |
| 🌐 Frontend                    | https://store-rating-frontend-lu9n.onrender.com             |
| 📖 API Documentation (Swagger) | https://store-rating-backend-pvwj.onrender.com/api/docs     |
| 📂 Source Code                 | https://github.com/shrenik879/roxiler-store-rating-platform |

---

## Features

### 👤 Normal User

* Secure registration and login
* Browse and search stores by name or address
* Submit ratings from 1–5 stars
* Update previously submitted ratings
* View average ratings and personal ratings

### 🏪 Store Owner

* View store's average rating
* View total ratings and unique users
* Browse all users who rated the store and their scores

### 🛡️ Admin

* Dashboard with users, stores, and ratings statistics
* Ratings-over-time and role distribution charts
* Recent activity feed
* Create and manage users and stores
* Search, sort, and paginate records
* Export users and stores to CSV

### 🔐 Security

* JWT access token authentication
* HttpOnly refresh token cookies
* Token rotation and revocation
* Role-based route protection
* Rate limiting and Helmet security headers
* Input validation using Joi
* CORS protection

---

## Architecture Overview

```text
┌──────────────────────────────────────────────────────┐
│                  React Frontend (Vite)              │
│                                                      │
│  • React 19                                          │
│  • Tailwind CSS                                      │
│  • TanStack Query                                    │
│  • React Hook Form + Zod                             │
│  • Framer Motion                                     │
└──────────────────────┬───────────────────────────────┘
                       │
                       │ HTTPS Requests (/api/*)
                       ▼
┌──────────────────────────────────────────────────────┐
│               Node.js + Express Backend             │
│                                                      │
│  Routes → Controllers → Services → Repositories     │
│                                                      │
│  • JWT Authentication                               │
│  • Role-Based Access Control (RBAC)                 │
│  • Joi Validation                                   │
│  • Helmet & CORS                                    │
│  • Rate Limiting                                    │
│  • Swagger API Documentation                        │
└──────────────────────┬───────────────────────────────┘
                       │
                       │ Sequelize ORM
                       ▼
┌──────────────────────────────────────────────────────┐
│                 SQLite Database                     │
│                                                      │
│  • Users                                             │
│  • Stores                                            │
│  • Ratings                                           │
│  • Refresh Tokens                                    │
│  • Activity Logs                                     │
└──────────────────────────────────────────────────────┘
```
## System Architecture

```text
                    ┌────────────────────┐
                    │      Browser       │
                    └─────────┬──────────┘
                              │
                              ▼
                ┌────────────────────────┐
                │ React Frontend (Vite)  │
                │                        │
                │ • Admin Dashboard      │
                │ • Owner Dashboard      │
                │ • User Dashboard       │
                └─────────┬──────────────┘
                          │ HTTPS /api/*
                          ▼
              ┌───────────────────────────┐
              │    Express REST API       │
              │                           │
              │ Authentication (JWT)      │
              │ Authorization (RBAC)      │
              │ Validation (Joi)          │
              │ Security (Helmet, CORS)   │
              │ Rate Limiting             │
              └──────────┬────────────────┘
                         │
                         ▼
              ┌───────────────────────────┐
              │     Sequelize ORM         │
              └──────────┬────────────────┘
                         │
                         ▼
              ┌───────────────────────────┐
              │      SQLite Database      │
              │                           │
              │ Users                     │
              │ Stores                    │
              │ Ratings                   │
              │ Refresh Tokens            │
              │ Activity Logs             │
              └───────────────────────────┘
```

---

## Tech Stack

| Layer            | Technologies                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Frontend         | React 19, Vite 5, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts, Framer Motion |
| Backend          | Node.js 20, Express 4, Sequelize 6, Joi, Winston, Morgan, Swagger UI                          |
| Database         | SQLite (`sqlite3`)                                                                            |
| Authentication   | JWT, bcrypt, HttpOnly cookies                                                                 |
| Containerization | Docker, Docker Compose                                                                        |
| Deployment       | Render                                                                                        |

---

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Runs at:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at:

```text
http://localhost:5173
```

---

## Docker

```bash
docker compose up --build
```

| Service     | URL                            |
| ----------- | ------------------------------ |
| Frontend    | http://localhost:8080          |
| Backend API | http://localhost:5000          |
| API Docs    | http://localhost:5000/api/docs |

---

## Demo Credentials

| Role        | Email                    | Password     |
| ----------- | ------------------------ | ------------ |
| Admin       | `admin@storerating.com`  | `Admin@1234` |
| Store Owner | `owner1@storerating.com` | `Owner@123`  |
| Normal User | `aarav@example.com`      | `User@1234`  |

---

## Project Structure

```text
roxiler-store-rating-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── seed/
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── contexts/
│   └── Dockerfile
│
├── docker-compose.yml
└── render.yaml
```

---

## Screenshots

### Admin Dashboard

<p align="center">
  <img width="900" src="https://github.com/user-attachments/assets/fc75ce89-c836-4622-b7ab-390d939a9e81" />
  <img width="900" src="https://github.com/user-attachments/assets/d888f2db-82b6-4853-a36b-446ecb0da085" />
  <img width="900" src="https://github.com/user-attachments/assets/efafafd3-7a01-4404-aa22-c2c6fb65c55f" />
</p>

### Store Owner Dashboard

<p align="center">
  <img width="900" src="https://github.com/user-attachments/assets/88bba7b5-ca6d-4c23-9a64-d47a67d192f3" />
</p>

### User Dashboard

<p align="center">
  <img width="900" src="https://github.com/user-attachments/assets/f7e112bc-7e45-4bac-8390-c08f02f22d0f" />
</p>

---

## Assessment Highlights

* Three role-based dashboards (Admin, Store Owner, User)
* Layered MVC backend architecture
* JWT authentication with refresh token rotation
* Role-based authorization and protected routes
* Search, sorting, pagination, and CSV export
* Swagger API documentation
* Dockerized deployment
* Deployed on Render

