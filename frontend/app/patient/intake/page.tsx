"use client";

import Link from "next/link";
import { useState } from "react";
import { api, HealthIntake, PredictionResponse } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

const emptyForm: HealthIntake = {
  age: 30,
  sex: "female",
};

function label(text: string) {
  return <span className="mb-1 block">{text}</span>;
}

export default function IntakePage() {
  const { ready } = useAuthGuard("patient");
  const [form, setForm] = useState<HealthIntake>(emptyForm);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof HealthIntake>(key: K, value: HealthIntake[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function numberField(key: keyof HealthIntake, step?: string) {
    return {
      type: "number" as const,
      step,
      value: (form[key] as number | undefined) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        update(key, (e.target.value ? Number(e.target.value) : undefined) as never),
      className: "mt-1 rounded border border-gray-300 px-3 py-2",
    };
  }

  function selectIntField(key: keyof HealthIntake) {
    return {
      value: form[key] === undefined ? "" : String(form[key]),
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
        update(key, (e.target.value === "" ? undefined : Number(e.target.value)) as never),
      className: "mt-1 rounded border border-gray-300 px-3 py-2",
    };
  }

  function checkboxField(key: keyof HealthIntake) {
    return {
      type: "checkbox" as const,
      checked: !!form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => update(key, e.target.checked as never),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const response = await api.submitIntake(form);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Link href="/patient/dashboard" className="mb-4 inline-block text-sm text-gray-500 hover:underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="mb-2 text-2xl font-semibold">Health Intake Form</h1>
      <p className="mb-6 text-sm text-gray-600">
        This information is used to generate a preliminary risk indication for heart disease, diabetes and
        hypertension. It does not replace a medical diagnosis. Only age and sex are required — leave anything else
        blank if you don&apos;t have it on hand.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="col-span-2 mb-1 font-medium">Demographics</legend>
          <label className="text-sm">
            {label("Age")}
            <input
              type="number"
              required
              value={form.age}
              onChange={(e) => update("age", Number(e.target.value))}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            {label("Sex")}
            <select
              value={form.sex}
              onChange={(e) => update("sex", e.target.value as HealthIntake["sex"])}
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="col-span-2 mb-1 font-medium">Vitals &amp; labs</legend>
          <label className="text-sm">
            {label("Systolic blood pressure (mmHg)")}
            <input {...numberField("systolic_bp")} />
          </label>
          <label className="text-sm">
            {label("Total cholesterol (mg/dL)")}
            <input {...numberField("cholesterol")} />
          </label>
          <label className="text-sm">
            {label("Blood glucose (mg/dL)")}
            <input {...numberField("blood_glucose_mgdl")} />
          </label>
          <label className="text-sm">
            {label("HbA1c (%)")}
            <input {...numberField("hba1c_level", "0.1")} />
          </label>
          <label className="text-sm">
            {label("BMI")}
            <input {...numberField("bmi", "0.1")} />
          </label>
          <label className="text-sm">
            {label("Max heart rate during exercise (bpm)")}
            <input {...numberField("max_heart_rate")} />
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="col-span-2 mb-1 font-medium">Cardiac exam findings</legend>
          <p className="col-span-2 -mt-1 mb-1 text-xs text-gray-500">
            These typically come from a clinician&apos;s exam (ECG, stress test, angiography) rather than
            self-report — leave blank if you don&apos;t have them and a nurse/doctor can fill them in later.
          </p>
          <label className="text-sm">
            {label("Chest pain type")}
            <select {...selectIntField("chest_pain_type")}>
              <option value="">Unknown</option>
              <option value={0}>Typical angina</option>
              <option value={1}>Atypical angina</option>
              <option value={2}>Non-anginal pain</option>
              <option value={3}>Asymptomatic</option>
            </select>
          </label>
          <label className="text-sm">
            {label("Resting ECG")}
            <select {...selectIntField("resting_ecg")}>
              <option value="">Unknown</option>
              <option value={0}>Normal</option>
              <option value={1}>ST-T wave abnormality</option>
              <option value={2}>Left ventricular hypertrophy</option>
            </select>
          </label>
          <label className="text-sm">
            {label("ST slope (exercise)")}
            <select {...selectIntField("st_slope")}>
              <option value="">Unknown</option>
              <option value={0}>Upsloping</option>
              <option value={1}>Flat</option>
              <option value={2}>Downsloping</option>
            </select>
          </label>
          <label className="text-sm">
            {label("ST depression (oldpeak)")}
            <input {...numberField("st_depression", "0.1")} />
          </label>
          <label className="text-sm">
            {label("Major vessels colored (0-4)")}
            <select {...selectIntField("major_vessels_colored")}>
              <option value="">Unknown</option>
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>
          <label className="text-sm">
            {label("Thalassemia")}
            <select {...selectIntField("thalassemia")}>
              <option value="">Unknown</option>
              <option value={1}>Normal</option>
              <option value={2}>Fixed defect</option>
              <option value={3}>Reversible defect</option>
            </select>
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input {...checkboxField("exercise_angina")} />
            Exercise-induced chest pain (angina)
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="col-span-2 mb-1 font-medium">Lifestyle</legend>
          <label className="col-span-2 text-sm">
            {label("Smoking history")}
            <select
              value={form.smoking_history ?? ""}
              onChange={(e) => update("smoking_history", (e.target.value || undefined) as HealthIntake["smoking_history"])}
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Unknown</option>
              <option value="never">Never smoked</option>
              <option value="current">Current smoker</option>
              <option value="former">Former smoker</option>
              <option value="ever">Smoked at some point</option>
              <option value="not current">Not currently smoking</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...checkboxField("drinks_alcohol")} />
            Drinks alcohol
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...checkboxField("physically_active")} />
            Physically active
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="col-span-2 mb-1 font-medium">Prior diagnoses</legend>
          <label className="flex items-center gap-2 text-sm">
            <input {...checkboxField("has_hypertension")} />
            Diagnosed with hypertension
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...checkboxField("has_heart_disease")} />
            Diagnosed with heart disease
          </label>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Submit for risk prediction"}
        </button>
      </form>

      {result && (
        <div className="mt-8 rounded-lg border border-gray-200 p-4">
          <h2 className="mb-3 font-semibold">Risk indication</h2>
          <ul className="flex flex-col gap-2">
            {result.results.map((r) => (
              <li key={r.condition} className="flex items-center justify-between">
                <span className="capitalize">{r.condition.replace("_", " ")}</span>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    r.risk_class === "elevated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {r.risk_class} ({Math.round(r.risk_score * 100)}%)
                </span>
              </li>
            ))}
          </ul>
          {result.any_elevated && (
            <p className="mt-4 text-sm text-red-700">
              One or more indications are elevated. Please{" "}
              <Link href="/patient/appointments" className="underline">
                book a teleconsultation
              </Link>{" "}
              with a doctor.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
