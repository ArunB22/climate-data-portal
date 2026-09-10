# Vasudha Foundation — Climate/Energy/Power Data Portal

Full-stack app to manage and publicly visualize Climate, Energy and Power
datasets. Admins upload CSVs, a Super Admin approves/edits/deletes them,
approved datasets render as public maps/charts — no login to view.

## Features

**Super Admin**
- Views every dataset with the submitting Admin's email
- Approve / reject pending datasets (approval sets publish order)
- Edit or delete any Admin's dataset, any status
- Create Admin accounts, enable/disable them

**Admin**
- Upload a CSV with domain (Climate/Energy/Power), chart type, chart title
- Server-side validation, row-level errors on bad data
- New uploads default to Pending, hidden from public until approved
- Dashboard: own datasets + status counts

**Public** (no login)
- Landing page (all approved, in approval order) and `/climate` `/energy` `/power`
- Lat/Long → interactive Leaflet map, click a point for details
- State-wise → India choropleth (d3-geo)
- Time-series → line/bar/area (Admin's choice at upload)
- All three render generically off whatever columns the CSV has — nothing
  hardcoded to the sample files
- Responsive down to phone width

**Bonus items not done** (§12, extra credit): email-on-account-creation,
forgot/reset password, Figma prototype. Responsive design (also §12) is done.

## Stack

- Backend: Java 21, Spring Boot 4.1 (Web, Security, JPA, Validation), JWT auth
- Frontend: Angular 22, standalone components
- DB: PostgreSQL + Flyway. Dataset rows stored as generic `{columns, rows}`
  JSON, not a fixed table per chart type, so any CSV of a supported shape
  works without code changes
- Charts: ngx-charts (line/bar/area), Leaflet (map), d3-geo/d3-scale (choropleth)
- Deploy: Render (backend + Postgres) + Vercel/Netlify (frontend)

## Structure

```
backend/src/main/java/org/vasudha/portal/
  config/      security, CORS, Super Admin auto-seed
  security/    JWT filter, token service
  domain/      Dataset entity
  user/        User entity, repo, service
  dataset/     CSV parsing/validation, DatasetService
  web/         REST controllers, DTOs, error handling

frontend/src/app/
  core/        models, services, interceptors, route guard
  shared/ui/   Button, Card, Field, etc.
  features/    public, auth, admin, superadmin, shared layout
```

## API routes

| Route | Access |
|---|---|
| `POST /api/auth/login` | public |
| `GET /api/public/datasets[/domain/{domain}]` | public |
| `/api/admin/datasets/**` | Admin, Super Admin |
| `/api/superadmin/**` | Super Admin only |

## Setup

Needs: Java 21, Node 20+, Postgres 14+ (or Docker).

```bash
docker run -d --name vasudha-postgres -p 5432:5432 \
  -e POSTGRES_DB=climate_portal -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine

cd backend
cp .env.example .env   # set a real JWT_SECRET
export $(grep -v '^#' .env | xargs)
./mvnw spring-boot:run   # :8080, Flyway migrates on boot, Super Admin auto-seeds

cd frontend
npm install
npm start   # :4200
```

Default login: `superadmin@vasudhaindia.org` / `Admin@123` (override via
`SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD`). **Change this before deploying
publicly** — it's the assessment's documented default, so it's not a secret.

## Env vars (backend)

| Var | Purpose | Default |
|---|---|---|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | Postgres connection | localhost, postgres/postgres |
| `JWT_SECRET` | JWT signing key | dev fallback — set explicitly for deploy |
| `JWT_EXPIRATION_MINUTES` | Token lifetime | 120 |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin(s) | `http://localhost:4200` |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | Auto-seeded account | see above |
| `PORT` | Server bind port (Render sets this) | 8080 |

Frontend has no runtime env vars — API base URL is baked in at build time
via `environment.ts` / `environment.prod.ts`.

## Deployment

Render (backend + Postgres, via `render.yaml`, which builds the backend from
`backend/Dockerfile` — the only place this app runs in Docker; local dev runs
the JDK/Node toolchains directly) + Vercel/Netlify (frontend, via
`vercel.json`/`netlify.toml`). Both need a one-time dashboard step to
connect the GitHub repo; `render.yaml` needs the DB's JDBC URL pasted in by
hand (Render gives `postgres://`, Spring needs `jdbc:postgresql://`). Render's
free tier cold-starts after idle (~30-60s first request).

## Assumptions

- "Status" and "approval status" (§1) are the same PENDING/APPROVED/REJECTED value
- CSV column names matched case-insensitively
- The supplied states GeoJSON has one malformed feature (Dadra and Nagar
  Haveli and Daman and Diu — truncated coordinates); filtered out client-side
- No automated tests; verified by hand against the sample CSVs, including
  deliberately malformed rows, against a real Postgres instance
