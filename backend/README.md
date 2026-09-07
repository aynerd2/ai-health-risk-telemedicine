# Backend — FastAPI (AI Health Risk Prediction & Telemedicine)

## Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS
```

For local development without a MySQL server, just point `DATABASE_URL` at
SQLite instead — everything in this app (including Alembic) works against
either:

```
DATABASE_URL=sqlite:///./dev.db
```

## Run locally

```bash
alembic upgrade head             # create/update tables
uvicorn app.main:app --reload
```

- API root: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/api/v1/health

## Creating the first admin account

Admins can't self-register through `/api/v1/auth/register` (that endpoint
rejects `role: "admin"` to stop anyone from granting themselves admin). Bootstrap
the first admin directly:

```bash
python -m app.core.bootstrap admin@example.com "a strong password" "Admin Name"
```

From there, that admin can approve doctor registrations from
`/api/v1/admin/doctors/pending` (or the frontend's admin dashboard).

## Tests

```bash
pytest
```

Most tests run against an in-memory SQLite database and stub out the three
ML models (see `tests/conftest.py`) so the suite passes even without trained
models. `tests/test_prediction_service_real_models.py` is the exception — it
loads the actual `.pkl` files and exercises `predict_all()` for real (skips
itself if they're missing), to catch column-mapping/dtype bugs the stub
can't.

## Training the ML models

The three trained pipelines already live in `app/ml_models/*.pkl` (see
BUILD_PLAN.md for which dataset each was trained on, and the metrics). To
retrain one — after editing its CSV, or its training script's feature list —
run:

```bash
python scripts/train_heart_model.py
python scripts/train_diabetes_model.py
python scripts/train_hypertension_model.py
```

Each script (Sections 3.7–3.10 of the methodology): imputes missing values,
scales numeric / one-hot encodes categorical columns via a
`ColumnTransformer`, does an 80/20 stratified split, 5-fold cross-validates
a `LogisticRegression` pipeline, evaluates on the held-out test set
(accuracy/precision/recall/F1/balanced accuracy + confusion matrix), prints
a coefficient sanity check, and `joblib.dump()`s the fitted pipeline plus a
metrics JSON into `app/ml_models/`. `scripts/train_common.py` holds the
shared plumbing.

Each pipeline is loaded once at application start-up
(`app/services/prediction_service.py`), which also has one `_*_frame()`
function per condition mapping `HealthIntakeRequest` onto that model's exact
training columns (including a few values that need bucketing — e.g. a raw
cholesterol mg/dL reading becomes the hypertension model's 3-level
normal/above-normal/well-above-normal category). If you retrain against a
CSV with different columns, update the matching `_*_frame()` function and
that script's `NUMERIC_FEATURES`/`CATEGORICAL_FEATURES` lists together.

## Project layout

```
app/
  core/        settings, DB session, JWT/password hashing, auth dependencies,
               bootstrap.py (create the first admin)
  models/      SQLModel tables (matches the ERD in Figure 3.3)
  schemas/     Pydantic request/response schemas
  routers/     auth, prediction, appointments (+ doctors, consultations),
               admin, telemedicine (WebSocket)
  services/    prediction_service.py — loads & runs the 3 ML models
  ml_models/   trained .pkl files (gitignored) + *_metrics.json (committed)
  main.py      app entrypoint, CORS, router wiring
migrations/    Alembic migrations (env.py reads DATABASE_URL from .env)
scripts/       train_heart_model.py / train_diabetes_model.py /
               train_hypertension_model.py / train_common.py (shared eval)
tests/         pytest suite (auth, prediction, appointments/consultation)
training_data/ the CSVs the training scripts read (not committed to git)
```

## Database migrations

`init_db()` (called at startup) auto-creates tables for local/dev convenience.
Alembic is already wired up (`migrations/env.py` reads `DATABASE_URL` from
`.env` and targets `SQLModel.metadata`) — use it for anything beyond a quick
local run:

```bash
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

## Deployment

Deploy this service to a container-capable host (Render, Railway, Fly.io, a
VPS, etc.) rather than Vercel — it needs to hold the ML models in memory and
keep WebSocket connections open, which doesn't fit Vercel's serverless model.
Set `CORS_ORIGINS` to include your deployed Next.js URL.
