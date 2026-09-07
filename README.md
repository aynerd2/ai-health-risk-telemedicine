# AI Health Risk Prediction & Telemedicine

A web platform that brings together three things that are usually built as separate products: patient registration, remote doctor consultations, and AI-driven risk screening for heart disease, diabetes, and hypertension.

The idea started from a fairly simple observation: most telemedicine apps let you talk to a doctor, and most health-prediction tools give you a risk score, but almost none of them do both in the same place. If a patient's risk score comes back elevated, they still have to go find a way to actually see someone about it. This project tries to close that gap — a patient fills in some basic health information, gets an immediate risk indication for three common conditions, and if anything looks concerning, they can go straight into booking a consultation without leaving the platform.

It was originally built as a university final-year project, and we're releasing it publicly in case it's useful to other students, developers, or anyone experimenting with health-tech ideas.

> **This is not a medical device.** The risk predictions are statistical estimates from models trained on public datasets, not a diagnosis. Nothing in this project should be used to make real medical decisions. See [Disclaimer](#disclaimer) below.

---

## What it does

- **Patients** can register, fill out a health intake form, and instantly get a risk indication for heart disease, diabetes, and hypertension. If any result is elevated, they're prompted to book a consultation.
- **Doctors** get a dashboard showing their upcoming appointments, a summary of each patient's health data and risk scores before the call, and a live chat during the consultation. They record notes and a diagnosis at the end of each session.
- **Admins** approve new doctor accounts, manage users, and get basic usage stats.

The whole thing is split into two independent pieces — a Python API and a separate web frontend — that only talk to each other over HTTP/WebSocket. That means either half can be redeployed, rewritten, or swapped out without touching the other.

## Screenshots

*(Add your own screenshots here once you have the app running locally — drop them in a `docs/screenshots/` folder and reference them below.)*

```
docs/screenshots/patient-intake.png
docs/screenshots/patient-results.png
docs/screenshots/doctor-dashboard.png
docs/screenshots/consultation-chat.png
docs/screenshots/admin-dashboard.png
```

## Tech stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — the API framework
- [SQLModel](https://sqlmodel.tiangolo.com/) — database models and queries, built on SQLAlchemy
- [Alembic](https://alembic.sqlalchemy.org/) — database migrations
- MySQL in production, SQLite works fine for local development
- [scikit-learn](https://scikit-learn.org/) — the three Logistic Regression risk models
- JWT-based authentication (no third-party auth provider required)

**Frontend**
- [Next.js](https://nextjs.org/) (React, App Router)
- TypeScript
- Tailwind CSS

**Real-time**
- WebSockets for the in-consultation chat (video calling is expected to be handled by a separate WebRTC provider — see [Telemedicine notes](#telemedicine-video))

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/          settings, database session, JWT/password hashing, auth dependencies
│   │   ├── models/        SQLModel database tables
│   │   ├── schemas/       request/response validation
│   │   ├── routers/       auth, predictions, appointments, admin, telemedicine
│   │   ├── services/      the ML prediction service
│   │   └── ml_models/     trained model files go here (heart_model.pkl, diabetes_model.pkl, hypertension_model.pkl)
│   ├── training_data/     put your CSV datasets here before training
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── app/               pages, grouped by role (patient/, doctor/, admin/)
    ├── lib/               API client
    └── package.json
```

## Getting started

You'll need:
- Python 3.11+ (the project has also been tested on 3.14, though some dependency versions needed bumping — see `requirements.txt`)
- Node.js 18+
- MySQL, if you're not using SQLite for local dev

### 1. Clone and set up the backend

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name/backend

python -m venv venv
source venv/bin/activate      # on Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and fill in the values — see [Environment variables](#environment-variables) below for what each one means and how to generate it.

Then run the API:

```bash
uvicorn app.main:app --reload
```

You should be able to open `http://localhost:8000/docs` and see the interactive API documentation. If that loads, the backend is working.

### 2. Set up the frontend

In a separate terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Then start it:

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

### 3. Try it out

- Go to `http://localhost:3000/register` and create a patient account.
- Register a second account as a doctor (a doctor account needs to be approved by an admin before it can accept appointments — see below).
- Create the first admin account so you have someone to do the approving:

```bash
cd backend
python -m app.core.bootstrap
```

This will prompt you for an email and password and create an admin account directly — there's no public sign-up path for admins, on purpose.

## Environment variables

### Backend (`backend/.env`)

| Variable | What it's for | How to get a value |
|---|---|---|
| `DATABASE_URL` | Where the app stores its data | For local dev, `sqlite:///./health_db.sqlite3` works with zero setup. For MySQL: `mysql+pymysql://<user>:<password>@<host>:3306/<database>` — create the database first with `CREATE DATABASE health_db;` |
| `JWT_SECRET_KEY` | Signs login tokens — keep this private | Generate a random one: `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `CORS_ORIGINS` | Which frontend URLs are allowed to call the API | `["http://localhost:3000"]` for local dev; add your deployed frontend URL once you have one |
| `ML_MODELS_DIR` | Where the trained model files live | Leave as `app/ml_models` unless you've moved things |

### Frontend (`frontend/.env.local`)

| Variable | What it's for |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | The URL of your running backend |

None of these are third-party API keys you sign up for anywhere — they're either generated locally or point at your own database.

## Training the risk models

The three prediction models aren't included in this repo (they're a few hundred KB to a few MB each, and it felt more honest to let people train them on data they've actually looked at rather than ship a black box). To train them yourself:

1. Download three datasets from Kaggle — a heart disease dataset (the UCI Cleveland set works well), a diabetes dataset, and a hypertension dataset. Search terms that get you there quickly:
   - "heart disease UCI dataset"
   - "diabetes prediction dataset"
   - "hypertension risk prediction dataset"
2. Place the CSVs in `backend/training_data/`.
3. Run the training scripts:

```bash
cd backend
python -m app.training.train_heart_model
python -m app.training.train_diabetes_model
python -m app.training.train_hypertension_model
```

Each script handles preprocessing (missing values, encoding, scaling), does a stratified train/test split with cross-validation, and prints out accuracy, precision, recall, and F1 for the resulting model before saving it to `app/ml_models/`.

A couple of things worth knowing if you're using your own dataset instead:
- Column names and available features vary a lot between dataset versions. You'll likely need to adjust the feature list in `app/services/prediction_service.py` to match whatever columns you actually have.
- If your dataset has a skewed class distribution (this comes up a lot with diabetes datasets, where the "no diabetes" class often outnumbers "diabetes" 10 to 1), plain accuracy will look artificially good while the model quietly misses most of the positive cases. Pay attention to recall, and consider `class_weight="balanced"` in the LogisticRegression call.

## Telemedicine video

The chat portion of a consultation runs over a WebSocket built into the backend. Video calling is intentionally left out of scope for this repo — running video infrastructure well (TURN servers, NAT traversal, recording, etc.) is a project in itself, and there are solid managed providers (Daily, Twilio, Agora, and others) that handle it far better than a bespoke implementation would. The consultation page has a placeholder where you'd drop in whichever provider's embed or SDK you choose.

## Running tests

```bash
cd backend
pytest
```

## Deployment notes

The frontend deploys cleanly to Vercel — it's a standard Next.js app.

The backend needs somewhere that can run a persistent Python process (it holds the three ML models in memory and keeps WebSocket connections open), so a serverless platform like Vercel isn't a good fit for it. Render, Railway, Fly.io, or a plain VPS all work fine. Wherever you put it, make sure `CORS_ORIGINS` in the backend's `.env` includes your deployed frontend's URL, or the browser will block requests to the API.

## Contributing

Issues and pull requests are welcome. If you're planning something bigger than a small fix, it's worth opening an issue first to talk through the approach before putting the work in.

A few things that would genuinely help if anyone wants to pick them up:
- Swapping the in-memory WebSocket room registry for something backed by Redis, so the telemedicine chat works across multiple backend instances
- Email delivery for the password reset flow (right now the reset token comes back directly in the API response, which is fine for local development but not something you'd want in production)
- A proper CI pipeline running the test suite on pull requests

## Disclaimer

This project generates statistical risk estimates using machine learning models trained on public datasets. It is **not** a diagnostic tool, has not been clinically validated, and should not be used to make real decisions about anyone's health. If you or someone you know is dealing with a health concern, please see an actual healthcare professional.

## License

MIT — see [LICENSE](LICENSE).
