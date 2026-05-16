# MALS — Military Asset & Logistics Management System

> **A production-grade, full-stack web application for tracking, assigning, and managing military assets and personnel resources — simulating real DoD/Department of War logistics workflows.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Local Development Setup](#local-development-setup)
6. [Docker Deployment](#docker-deployment)
7. [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
8. [Default Credentials](#default-credentials)
9. [API Reference](#api-reference)
10. [Environment Variables](#environment-variables)
11. [Security Notes](#security-notes)
12. [Future Roadmap](#future-roadmap)

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│  Browser / Mobile                            │
│  Next.js 14 (App Router) + MUI v5           │
│  Deployed on Vercel                          │
└──────────────────┬───────────────────────────┘
                   │ HTTPS + JWT Bearer
                   ▼
┌──────────────────────────────────────────────┐
│  Spring Boot 3.3 REST API (:8080)           │
│  JWT Auth + RBAC + Spring Security          │
│  Deployed on Render / AWS / Railway         │
└──────────────────┬───────────────────────────┘
                   │ JPA / JDBC
                   ▼
┌──────────────────────────────────────────────┐
│  PostgreSQL 16 (:5432)                      │
│  Docker container / Managed DB             │
└──────────────────────────────────────────────┘
```

---

## Features

### Authentication & RBAC
- JWT-based stateless authentication (no third-party auth services)
- Three roles: **ADMIN**, **COMMANDER**, **LOGISTICS_OFFICER**
- Role-specific dashboards, navigation, and API permissions
- Secure password hashing with BCrypt (cost factor 12)

### Asset Inventory Management
- Full CRUD for military assets: vehicles, weapons, equipment, supplies, aircraft, vessels, comms
- Fields: name, type, category, serial number, quantity, status, location, assignedTo, coordinates
- Asset statuses: Available / In Use / Maintenance / Deployed / Decommissioned
- Low-stock warnings (< 5 units)

### Mission Request Workflow
- Submit asset requests tied to a mission name
- Commander/Admin approval/rejection with notes
- Automatic inventory deduction on approval
- Asset quantity restored on mission completion

### Command Dashboard
- Stats cards: total assets, available, deployed, in maintenance
- Asset status pie chart (Recharts)
- Mission requests bar chart
- Low-stock alerts and quick-action buttons

### Tactical Map View
- Interactive Leaflet.js map showing asset locations
- Color-coded pins by status
- Asset popups with key information

### Reports & Export
- Full inventory report table
- Export to CSV (client-side)
- Export to PDF using jsPDF with autoTable

### Audit Log
- Immutable audit trail for all actions (create, update, delete, login, approve, etc.)
- Filterable by action and entity type
- Shows user, timestamp, IP address, and details

### Personnel Management (Admin)
- View all registered users
- Enable/disable user accounts

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | Next.js 14 (App Router), React 18, TypeScript  |
| UI Library  | Material UI v5 + Emotion                       |
| Charts      | Recharts                                       |
| Map         | Leaflet.js + react-leaflet                     |
| Forms       | React Hook Form + Zod                          |
| State       | Zustand                                        |
| HTTP Client | Axios with interceptors                        |
| PDF Export  | jsPDF + jsPDF-AutoTable                        |
| Backend     | Spring Boot 3.3, Java 21, Maven                |
| Security    | Spring Security 6 + JJWT 0.12                 |
| Database    | PostgreSQL 16 via Spring Data JPA              |
| Container   | Docker + Docker Compose                        |
| Frontend CD | Vercel                                         |

---

## Project Structure

```
mals/
├── frontend/                    # Next.js 14 application
│   ├── app/
│   │   ├── layout.tsx           # Root layout (MUI ThemeProvider)
│   │   ├── page.tsx             # Redirects to /dashboard
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx       # Authenticated shell (sidebar + topbar)
│   │       ├── dashboard/page.tsx
│   │       ├── assets/
│   │       │   ├── page.tsx     # Asset inventory table
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx         # Asset detail
│   │       │       └── edit/page.tsx    # Edit form
│   │       ├── requests/page.tsx
│   │       ├── audit/page.tsx
│   │       ├── map/page.tsx
│   │       ├── reports/page.tsx
│   │       └── users/page.tsx
│   ├── components/
│   │   ├── layout/              # Sidebar, TopBar
│   │   ├── dashboard/           # StatsCard, Charts
│   │   ├── assets/              # AssetForm
│   │   ├── map/                 # MapView (Leaflet, client-only)
│   │   └── common/              # StatusChip, ConfirmDialog
│   ├── lib/
│   │   ├── types.ts             # All TypeScript interfaces
│   │   └── api.ts               # Axios API service layer
│   ├── store/
│   │   └── authStore.ts         # Zustand auth state
│   ├── theme/
│   │   └── theme.ts             # MUI dark/light theme
│   ├── middleware.ts             # Next.js route protection
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── vercel.json
│
├── backend/                     # Spring Boot 3.3 application
│   ├── src/main/java/com/mals/
│   │   ├── MalsApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   └── DataInitializer.java    # Seeds DB on startup
│   │   ├── controller/          # REST controllers
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Spring Data JPA
│   │   ├── entity/              # JPA entities
│   │   ├── dto/                 # Request/Response DTOs
│   │   ├── enums/               # Role, AssetType, etc.
│   │   ├── security/            # JwtAuthFilter
│   │   └── exception/           # GlobalExceptionHandler
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── pom.xml
│   └── Dockerfile
│
├── docker-compose.yml           # Postgres + Backend
├── .env.example                 # Template for environment variables
└── README.md
```

---

## Local Development Setup

### Prerequisites

- **Node.js** 20+ (frontend)
- **Java 21** (backend)
- **Maven 3.9+** (backend build)
- **PostgreSQL 16** running locally, OR **Docker** (recommended)
- **Git**

---

### Step 1 – Clone and configure

```bash
git clone <repo-url>
cd mals
cp .env.example .env
# Edit .env with your local settings if needed
```

---

### Step 2 – Start PostgreSQL

**Option A (Docker – recommended):**
```bash
docker run -d \
  --name mals-postgres \
  -e POSTGRES_DB=mals_db \
  -e POSTGRES_USER=mals_user \
  -e POSTGRES_PASSWORD=mals_password \
  -p 5432:5432 \
  postgres:16
```

**Option B (Local PostgreSQL):**
```sql
CREATE DATABASE mals_db;
CREATE USER mals_user WITH PASSWORD 'mals_password';
GRANT ALL PRIVILEGES ON DATABASE mals_db TO mals_user;
```

---

### Step 3 – Run the Backend

```bash
cd backend

# Build and run
mvn spring-boot:run

# OR build JAR and run
mvn clean package -DskipTests
java -jar target/mals-backend-1.0.0.jar
```

The API will start at **http://localhost:8080**.

On first startup, `DataInitializer` seeds the database with:
- 3 default user accounts
- 20+ realistic military assets (Abrams tanks, Black Hawks, M4A1s, etc.)

---

### Step 4 – Run the Frontend

```bash
cd frontend

# Copy env file
cp .env.local.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8080/api

npm install
npm run dev
```

Frontend runs at **http://localhost:3000**.

---

## Docker Deployment

Run the full stack (backend + PostgreSQL) with Docker Compose:

```bash
# From the project root
cp .env.example .env
# Edit .env to set a strong JWT_SECRET

docker-compose up --build -d
```

Services started:
- **mals-postgres** on port 5432
- **mals-backend**  on port 8080

Check logs:
```bash
docker-compose logs -f backend
```

The frontend is **not** included in docker-compose — deploy it to Vercel separately.

---

## Vercel Deployment (Frontend)

1. **Push code to GitHub** (or connect a monorepo)

2. **Import project in Vercel:**
   - Root directory: `frontend`
   - Framework: Next.js (auto-detected)

3. **Set Environment Variables in Vercel dashboard:**
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
   ```

4. **CORS on backend:** Make sure your backend's `CORS_ALLOWED_ORIGINS` includes your Vercel URL:
   ```
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

5. Click **Deploy**.

---

## Default Credentials

Seeded automatically on first backend startup:

| Role              | Email               | Password         |
|-------------------|---------------------|------------------|
| Admin             | admin@mals.mil      | Admin@12345      |
| Commander         | hayes@mals.mil      | Command@12345    |
| Logistics Officer | chen@mals.mil       | Logistics@12345  |

> **Change all passwords immediately in any non-local environment.**

---

## API Reference

Base URL: `http://localhost:8080/api`

### Auth

| Method | Endpoint             | Description              | Auth |
|--------|----------------------|--------------------------|------|
| POST   | /auth/register       | Create new account       | ✗    |
| POST   | /auth/login          | Authenticate, get JWT    | ✗    |

### Assets

| Method | Endpoint          | Description                    | Min Role          |
|--------|-------------------|--------------------------------|-------------------|
| GET    | /assets           | Search/list assets (paginated) | Any               |
| GET    | /assets/{id}      | Get single asset               | Any               |
| POST   | /assets           | Create asset                   | LOGISTICS_OFFICER |
| PUT    | /assets/{id}      | Update asset                   | LOGISTICS_OFFICER |
| DELETE | /assets/{id}      | Delete asset                   | ADMIN             |

**Query params (GET /assets):**
`q`, `type`, `status`, `location`, `page`, `size`

### Mission Requests

| Method | Endpoint                  | Description               | Min Role   |
|--------|---------------------------|---------------------------|------------|
| GET    | /requests                 | List requests             | Any        |
| GET    | /requests/{id}            | Get request               | Any        |
| POST   | /requests                 | Submit new request        | Any        |
| PUT    | /requests/{id}/process    | Approve / Reject          | COMMANDER  |
| PUT    | /requests/{id}/complete   | Mark assets returned      | Any        |

### Dashboard

| Method | Endpoint          | Description       | Auth |
|--------|-------------------|-------------------|------|
| GET    | /dashboard/stats  | Aggregated stats  | Any  |

### Users

| Method | Endpoint          | Description           | Min Role |
|--------|-------------------|-----------------------|----------|
| GET    | /users            | List all users        | ADMIN    |
| GET    | /users/me         | Current user profile  | Any      |
| GET    | /users/{id}       | Get user by ID        | ADMIN    |
| PUT    | /users/{id}/enable  | Enable account      | ADMIN    |
| PUT    | /users/{id}/disable | Disable account     | ADMIN    |

### Audit Log

| Method | Endpoint | Description                   | Min Role  |
|--------|----------|-------------------------------|-----------|
| GET    | /audit   | Paginated, filterable log     | COMMANDER |

---

## Environment Variables

### Backend (`application.yml` / environment)

| Variable               | Default                         | Description                           |
|------------------------|---------------------------------|---------------------------------------|
| `DB_HOST`              | localhost                       | PostgreSQL host                       |
| `DB_PORT`              | 5432                            | PostgreSQL port                       |
| `DB_NAME`              | mals_db                         | Database name                         |
| `DB_USERNAME`          | mals_user                       | Database user                         |
| `DB_PASSWORD`          | mals_password                   | Database password                     |
| `JWT_SECRET`           | (see .env.example)              | **CHANGE IN PRODUCTION** – min 32 ch  |
| `JWT_EXPIRATION`       | 86400000                        | Token lifetime in ms (default 24h)    |
| `CORS_ALLOWED_ORIGINS` | http://localhost:3000            | Comma-separated allowed origins       |

### Frontend (`.env.local`)

| Variable                | Default                        | Description                     |
|-------------------------|--------------------------------|---------------------------------|
| `NEXT_PUBLIC_API_URL`   | http://localhost:8080/api      | Backend API base URL            |

---

## Security Notes

- **JWT stored in `localStorage`** — acceptable for a portfolio/internal tool. For higher-assurance systems, use HttpOnly cookies via a BFF (Backend for Frontend) pattern.
- **BCrypt cost factor 12** — strong default; increase to 14 for production if latency allows.
- **HTTPS required** in production — configure TLS termination at the reverse proxy/load balancer level.
- **Audit log is immutable** — all user actions are recorded with timestamp and IP.
- **CORS strictly configured** — only whitelisted origins can call the API.
- **Role-based endpoint guards** — Spring Security `@PreAuthorize` and URL matchers enforce permissions at the API layer, not just the frontend.
- **Input validation** — both backend (Jakarta Validation) and frontend (Zod) validate all user input.

---

## Future Roadmap

- [ ] HttpOnly cookie-based JWT (BFF pattern) for higher security
- [ ] Multi-factor authentication (TOTP)
- [ ] Real-time notifications via WebSocket / SSE
- [ ] Advanced analytics: monthly trend charts, utilization rates
- [ ] LDAP / Active Directory integration
- [ ] Asset maintenance scheduling and calendar view
- [ ] Barcode / QR code scanning for asset check-in/check-out
- [ ] Mobile-responsive PWA with offline capability
- [ ] Integration with DoD RFID tracking systems
- [ ] S3 / object storage for asset photos and documents
- [ ] CI/CD pipeline (GitHub Actions → Render + Vercel)
- [ ] Automated security scanning (OWASP ZAP, Trivy)

---

## Screenshots

> _Add screenshots here after first run_

| Login Screen | Command Dashboard | Asset Inventory |
|---|---|---|
| ![login]() | ![dashboard]() | ![assets]() |

| Tactical Map | Mission Requests | Audit Log |
|---|---|---|
| ![map]() | ![requests]() | ![audit]() |

---

## License

This project is for portfolio / educational purposes. Not for use with real classified information.

---

*Built to demonstrate full-stack engineering proficiency for Department of Defense / defense contracting roles.*
