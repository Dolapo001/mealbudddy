# MealBuddy

A university meal-recommendation system for students. It collects body metrics,
computes calorie targets (Mifflin–St Jeor), and serves a weekly plan of real
Nigerian foods scored against the user's goal and dietary preferences.

This repository implements the **Prototype → Production** migration described in
`MealBuddyArchitectureBlueprint.md`: a **Next.js 15** frontend and a **Django 5 +
DRF** backend, replacing the original static-HTML mock.

```
.
├── src/                  Next.js 15 frontend (App Router, TS, Tailwind)
├── middleware.ts         route guard
├── backend/              Django 5 + DRF API
├── docker-compose.yml    full local stack (web, worker, beat, postgres, redis, frontend)
└── Dockerfile            frontend production image
```

## Quick start

### Option A — frontend only (mock mode, no backend)

The frontend runs standalone with mock data, so you can walk the full journey
(landing → auth → onboarding → dashboard) immediately.

```bash
npm install
npm run dev          # http://localhost:3000
```

### Option B — full stack with Docker

```bash
docker compose up --build
# frontend  http://localhost:3000
# API       http://localhost:8000/api/v1
# API docs  http://localhost:8000/api/v1/docs
```

### Option C — backend locally (without Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
python manage.py migrate
python manage.py seed_foods
python manage.py runserver          # http://localhost:8000
```

To point the frontend at the real backend, set in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_READY=true
```

## Stack

**Frontend:** Next.js 15 (App Router), TypeScript, Tailwind, Framer Motion,
Zustand, Axios, React Hook Form, Zod, Sonner.

**Backend:** Python 3.13, Django 5, DRF, SimpleJWT, drf-spectacular, PostgreSQL
(SQLite fallback for dev/test), Redis, Celery, Channels, Docker.

## What's implemented (by milestone)

- **M1 — Frontend foundation.** Landing + auth pages ported pixel-faithfully,
  routing wired (no dead links), design tokens (canonical indigo theme).
- **M2 — Onboarding + dashboard.** Live BMI/TDEE metrics form, recommendations
  dashboard (weekly plan, day tabs, food modal, SVG nutrition donut, star
  feedback), foods index, history, goal, settings, profile — all componentised
  with skeletons, toasts, animated counters and Framer transitions.
- **M3 — Backend foundation.** Django project, split settings, core base models
  (UUID PK / timestamps / soft-delete), Docker, drf-spectacular docs.
- **M4 — Auth end-to-end.** Register/login/logout/refresh, signed single-use
  email verification + password reset, RBAC; frontend wired to real JWT with a
  route guard.
- **M5 — Metrics + foods.** Persisted metrics with server-side derivations,
  seeded NFCT catalogue, searchable/filterable foods index.
- **M6 — Recommendations.** Pluggable baseline scorer behind
  `RecommendationService`, plan generation (sync + Celery async), swap/refresh,
  feedback persisted.
- **M7 — Realtime + pages.** Django Channels dashboard socket (plan-ready
  push), history/settings/profile pages.
- **M8 — Hardening (partial).** Backend test suite at **85%** coverage, Docker
  compose, API docs; performance/CI passes are the remaining work.

## Tests

```bash
# backend (pytest, 85% coverage)
cd backend && source .venv/bin/activate && pytest

# frontend
npm run typecheck && npm run build
```

## Design decisions (from the blueprint's open questions)

1. **Goal cards:** the prototype's duplicate "Gain muscle" is resolved into four
   distinct goals — Lose weight / Maintain / Gain muscle / Gain weight.
2. **Palette:** the app's indigo theme is canonical; the marketing landing keeps
   its navy/mint surface, scoped to `.mb-landing`.
3. **State:** Zustand (persisted) for auth and metrics.
4. **ML model:** a transparent baseline scorer ships now; the trained model
   loads later behind the same `RecommendationService` API.

See `backend/README.md` for the API surface and backend architecture.
