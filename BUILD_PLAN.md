# AI-Based Health Risk Prediction & Telemedicine — Build Plan

## Progress

- [x] **1. Backend plumbing** — Alembic wired up (`alembic upgrade head` works
      against SQLite or MySQL), `.env` configured for local SQLite dev,
      `/docs` and `/api/v1/health` confirmed working.
- [x] **2. Auth & role flows** — doctor approval workflow (admin router: list
      pending doctors, approve), refresh-token endpoint, forgot/reset-password
      endpoints. Also closed a gap: public `/auth/register` no longer accepts
      `role: "admin"` — bootstrap the first admin with
      `python -m app.core.bootstrap` (see backend/README.md).
- [x] **3. Appointments & consultations** — doctor confirm/cancel/complete,
      patient cancel, consultation notes endpoint, `GET /api/v1/doctors`
      (approved doctors only) for booking, admin `/stats` reporting.
- [x] **4/5. AI / ML — datasets trained, models wired in.** Three real
      datasets, three `backend/scripts/train_*.py` scripts implementing
      Sections 3.7-3.10 (impute → scale/one-hot via a `ColumnTransformer` →
      `LogisticRegression`, 80/20 stratified split, 5-fold CV, held-out
      accuracy/precision/recall/F1/balanced-accuracy + confusion matrix,
      `joblib.dump()`). Metrics saved next to each model in
      `app/ml_models/*_metrics.json`. `prediction_service.py`'s frame
      builders and `HealthIntakeRequest`/`HealthRecord` were rewritten to
      match the real columns of all three (see "Datasets used" below for the
      full story, including a dataset swap when one had no learnable
      signal). `python -m app.core.bootstrap` remains the only way to create
      an admin.
- [x] **6. Frontend wired up** — login/register, patient dashboard/intake/
      history/appointments, patient+doctor consultation chat pages
      (`/doctor/consultation/[apptId]`, `/patient/consultation/[apptId]`),
      admin dashboard (approvals, user list, stats), forgot/reset-password
      pages, and a full intake form covering every field the three trained
      models consume. All backed by a real auth guard (`lib/useAuthGuard.ts`)
      and the typed client in `lib/api.ts`. `npm run build` passes; the full
      register → login → intake → prediction → history flow was also
      exercised in an actual browser, not just curl/pytest.
- [x] **7. Testing** — 25 pytest tests covering auth, prediction (against
      both a stubbed model for fast API-contract tests, and the *real*
      trained pipelines in `test_prediction_service_real_models.py` to catch
      dtype/column-mapping bugs the stub can't), and the appointment/
      consultation flow (`backend/tests/`), run against an in-memory SQLite
      DB.

Also bumped `next` to 14.2.35 (was 14.2.5, which npm flagged with a known
CVE) and pinned the confirmed-working ML stack for this machine's Python
3.14 in `requirements.txt`: `scikit-learn==1.9.0`, `numpy==2.5.3`,
`pandas==2.3.3`, `sqlmodel==0.0.42` (the original scaffold's pins —
`scikit-learn==1.5.2`, `numpy==2.1.1`, `sqlmodel==0.0.22` — have no cp314
wheels / predate the pydantic version FastAPI pulls in and fail to
build/import).

## Datasets used (Step 4/5)

| Model | Dataset | Notes |
|---|---|---|
| Heart disease | `backend/training_data/Heart_disease.csv` (UCI heart-disease, 1025 rows) | Balanced target, all columns numeric. Test accuracy 87.3%, recall 90.5%, balanced accuracy 87.2%. |
| Diabetes | `backend/training_data/Diabetes.csv` (100k rows, ~8.5% positive) | Heavily imbalanced — trained with `class_weight="balanced"`. Test recall 89.4%, precision 42.7% (the right tradeoff for a screening tool per Section 3.10), balanced accuracy 89.1%. |
| Hypertension | `backend/training_data/cardio_train.csv` (sulianova/cardiovascular-disease-dataset, ~70k rows) | **This model was retrained once already.** The originally-downloaded `Hypertension.csv` (174,982 rows) turned out to have a label with *no measurable relationship to any of its columns* — every correlation ~0, every logistic-regression coefficient ~0, balanced accuracy exactly 0.5000 (random chance), even after including the demographic columns (`Country`/`Education_Level`/`Employment_Status`) that were initially excluded on ethical/practicality grounds. Verified this wasn't a pipeline bug before reporting it. Replaced it with `cardio_train.csv`: rather than trust a pre-made label, "hypertension" is derived directly from that dataset's own `ap_hi`/`ap_lo` blood-pressure readings via the ACC/AHA Stage-1 threshold (`ap_hi >= 130 OR ap_lo >= 80`), after dropping ~2% of rows with physiologically implausible BP/height/weight values. The model is trained on the *other* risk factors (age, BMI, cholesterol, glucose, smoking, alcohol, activity, gender) — not the BP readings themselves, since those would trivially determine the label by definition. `class_weight="balanced"` again (label is ~82% positive). Test balanced accuracy 0.624 vs. 0.5 chance — a real but modest effect, which is medically expected: these factors are associated with hypertension risk but don't fully determine an individual's blood pressure. |

`backend/scripts/train_common.py` has the shared 80/20 split, 5-fold CV,
metrics/confusion-matrix reporting, **and** the sanity-check helpers
(`print_correlation_report`, `print_coefficient_report`, a majority-class /
balanced-accuracy-vs-chance comparison with an automatic low-signal warning)
that caught the bad `Hypertension.csv` — run on every model, not just when
something looks off, since that's the only reason the problem surfaced
before shipping.

All seven build steps above are done: backend (auth, appointments,
admin, ML prediction) and frontend are wired together end-to-end and
tested, including through an actual browser session, not just curl/pytest.

## Retraining a model

```bash
cd backend
venv/Scripts/activate   # or source venv/bin/activate
python scripts/train_heart_model.py         # or train_diabetes_model.py / train_hypertension_model.py
```

Each script prints (and saves to `app/ml_models/<name>_metrics.json`) the
5-fold CV scores, held-out accuracy/precision/recall/F1/balanced-accuracy,
confusion matrix, and a logistic-regression coefficient report — check the
coefficient magnitudes and balanced-accuracy-vs-chance lift before trusting
a retrain, the same way the bad `Hypertension.csv` was caught (see "Datasets
used" above). If you swap in a new CSV for any of the three, update the
`NUMERIC_FEATURES`/`CATEGORICAL_FEATURES` column lists in that script and
the matching `_*_frame()` builder in `app/services/prediction_service.py`
to line up with the new file's columns.

## Repo layout

```
backend/    FastAPI app (see backend/README.md)
frontend/   Next.js app
```
