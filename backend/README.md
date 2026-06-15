# MealBuddy — Backend (Django 5 + DRF)

REST API for the MealBuddy meal-recommendation system. JWT auth, server-side
metric derivation, an NFCT food catalogue, a pluggable recommendation engine,
feedback capture, and live dashboard updates over WebSockets.

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # optional; SQLite is used if DATABASE_URL is unset
python manage.py migrate
python manage.py seed_foods     # load the NFCT catalogue
python manage.py runserver
```

- API root: `http://localhost:8000/api/v1/`
- Swagger: `/api/v1/docs` · ReDoc: `/api/v1/redoc` · schema: `/api/v1/schema`
- Health: `/health/`

Tests: `pytest` (33 tests, 85% coverage).

## Layout

```
backend/
├── config/          settings/{base,dev,test,prod}, urls, asgi (Channels), wsgi, celery
├── core/            base models (UUID/timestamps/soft-delete), pagination, exceptions, permissions
├── apps/
│   ├── accounts/    custom User + Profile, JWT auth, verification & reset, RBAC
│   ├── metrics/     body-metric snapshots + derivations
│   ├── foods/       NFCT catalogue (Food/DietaryTag), filters, seed command
│   ├── recommendations/  MealPlan/MealPlanItem, WS consumer + JWT middleware
│   └── feedback/    ratings + reason chips
├── api/             versioned /api/v1 router + schema/docs
├── services/        AuthService, MetricsService, RecommendationService
├── tasks/           Celery: email, recommendation generation, retrain signal
├── integrations/    pluggable ML scorer adapter
└── tests/           pytest suite + fixtures
```

## API surface (`/api/v1`)

**Auth & accounts**
- `POST /auth/register` · `POST /auth/login` · `POST /auth/logout`
- `POST /auth/token/refresh` · `POST /auth/verify-email` · `POST /auth/resend-verification`
- `POST /auth/password/forgot` · `POST /auth/password/reset`
- `GET/PATCH /accounts/me` · `GET/PATCH /accounts/me/profile`

**Metrics**
- `GET/POST /metrics` · `GET /metrics/current` · `GET /metrics/derived`

**Foods**
- `GET /foods` (search / tag / macro filters) · `GET /foods/{slug}` · `GET /foods/tags`

**Recommendations**
- `POST /recommendations/generate` (sync, or `async_mode` via Celery)
- `GET /recommendations/current` · `GET /recommendations/{id}`
- `POST /recommendations/{id}/refresh`
- `GET/PATCH/DELETE /recommendations/items/{id}` (swap / adjust / remove a meal)

**Feedback**
- `POST /feedback` · `GET /feedback/mine`

**Realtime**
- `ws://…/ws/dashboard/?token=<access>` — pushes `plan_ready` events.

## Notes

- **Auth:** Argon2 hashing, short-lived access + rotating refresh (blacklisted on
  logout). Email-verification and reset tokens are signed, single-use, short-TTL.
- **Security:** throttling on auth + generate endpoints, object-level permissions
  (users only touch their own data), strict CORS, prod security headers.
- **Derivations** mirror the frontend `lib/calc.ts` exactly, so the client
  preview and the authoritative server value always agree; the client number is
  never trusted.
- **Recommendation engine** scores foods with a transparent baseline
  (`integrations/ml_model.py`); the trained model swaps in behind `get_scorer()`
  without changing the API.
