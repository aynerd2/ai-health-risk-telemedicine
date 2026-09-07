# AI Health Risk Prediction & Telemedicine — Frontend

This is the web app for the AI Health Risk Prediction & Telemedicine platform. It's what patients, doctors, and admins actually see and use — registration, the health intake form, risk results, appointment booking, and the live consultation chat.

The backend that powers this lives in a separate repo: [health-risk-telemedicine-api](#) *(update this link once you have it)*.

> This is not a medical device. The risk predictions shown here come from statistical models trained on public datasets, not a diagnosis. See [Disclaimer](#disclaimer).

## Tech stack

- **Next.js** (App Router) — React framework
- **TypeScript**
- **Tailwind CSS** — styling

## Project structure

```
app/
├── login/, register/          auth pages
├── patient/
│   ├── dashboard/
│   ├── intake/                 health intake form → AI risk results
│   └── history/
├── doctor/
│   ├── dashboard/
│   └── consultation/           live chat during a consultation
└── admin/
    └── dashboard/
lib/
└── api.ts                      typed client for talking to the backend
```

## Running it locally

You'll need Node.js 18+.

```bash
git clone https://github.com/your-username/your-frontend-repo.git
cd your-frontend-repo

npm install
```

Create `.env.local` in the project root:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

That should point at wherever your backend is running — `http://localhost:8000` if you're running it locally alongside this, or your deployed backend's URL otherwise.

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

| Variable | What it's for |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | The full URL of the backend API this app talks to. No trailing slash. |

That's the only one this app needs. It's public-facing by design (the `NEXT_PUBLIC_` prefix means it's bundled into the browser code) since the frontend has to know where to send requests — there's no secret in it.

## Using the app

1. Register an account as a patient (or as a doctor — doctor accounts need to be approved by an admin before they can accept appointments, which happens on the backend).
2. As a patient, fill out the health intake form and submit it — you'll get back a risk indication for heart disease, diabetes, and hypertension.
3. If any result comes back elevated, you'll be prompted to book a consultation with a doctor.
4. As a doctor, log in to see upcoming appointments, review the patient's submitted health data and risk scores, and chat live during the consultation.

## Video calling

The consultation page includes a live text chat over WebSocket, connected directly to the backend. Video itself isn't wired in yet — the intent is to drop in a managed provider's embed (Daily, Twilio, Agora, etc.) rather than build video infrastructure from scratch. Look for the placeholder in the consultation page component if you want to add this.

## Building for production

```bash
npm run build
npm run start
```

## Deploying to Vercel

1. Push this repo to GitHub if it isn't already.
2. Go to [vercel.com](https://vercel.com), sign in, click **Add New → Project**, and import this repo.
3. Vercel will detect it's a Next.js app automatically — no build settings need changing.
4. Before deploying, add an environment variable:
   - **Key:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** your deployed backend's URL (e.g. `https://health-risk-telemedicine-api.onrender.com`) — no trailing slash
5. Click **Deploy**.

Once it's live, Vercel gives you a URL like `https://your-app.vercel.app`.

### Important: update the backend afterward

Your backend only accepts requests from origins listed in its `CORS_ORIGINS` setting. Once you have your Vercel URL:

1. Go to your backend's hosting dashboard (Render, or wherever it's deployed).
2. Update the `CORS_ORIGINS` environment variable to include your Vercel URL, e.g.:
   ```
   ["https://your-app.vercel.app"]
   ```
   or, if you still want local development to keep working too:
   ```
   ["http://localhost:3000","https://your-app.vercel.app"]
   ```
3. Redeploy (or restart) the backend for the change to take effect.

If you skip this step, the deployed frontend will load fine but every API request will fail silently with a CORS error in the browser console — that's the most common thing to check first if the app looks broken after deploying.

## Disclaimer

This project generates statistical risk estimates using machine learning models trained on public datasets. It is not a diagnostic tool, has not been clinically validated, and should not be used to make real decisions about anyone's health. If you or someone you know has a health concern, please see an actual healthcare professional.

## License

MIT — see [LICENSE](LICENSE).
