"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Body, Card, PageTitle, SectionHeader } from "@/components/ui/Card";
import { Checkbox, Field, SelectInput, TextInput } from "@/components/ui/FormField";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { CountUp } from "@/components/ui/CountUp";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { useToast } from "@/components/ui/Toast";
import { api, ConditionRisk, HealthIntake, PredictionResponse } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

const emptyForm: HealthIntake = { age: 30, sex: "female" };

const STEPS = ["Demographics", "Vitals & labs", "Cardiac exam", "Lifestyle"];

const CONDITION_META: Record<ConditionRisk["condition"], { label: string; description: string }> = {
  heart_disease: { label: "Heart Disease", description: "Based on cardiac exam findings, vitals and history." },
  diabetes: { label: "Diabetes", description: "Based on glucose, HbA1c, BMI and prior conditions." },
  hypertension: { label: "Hypertension", description: "Based on BMI, cholesterol, lifestyle and demographics." },
};

export default function IntakePage() {
  const { ready } = useAuthGuard("patient");
  const toast = useToast();
  const [step, setStep] = useState(0);
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
    };
  }

  function selectIntField(key: keyof HealthIntake) {
    return {
      value: form[key] === undefined ? "" : String(form[key]),
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
        update(key, (e.target.value === "" ? undefined : Number(e.target.value)) as never),
    };
  }

  function checkboxField(key: keyof HealthIntake) {
    return {
      checked: !!form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => update(key, e.target.checked as never),
    };
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const response = await api.submitIntake(form);
      setResult(response);
      toast.success("Your risk assessment is ready.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setForm(emptyForm);
    setStep(0);
    setResult(null);
    setError(null);
  }

  if (!ready) return null;

  const direction = 1;
  const variants = {
    enter: { opacity: 0, x: 24 * direction },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 * direction },
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            <PageTitle>Health Intake Form</PageTitle>
            <Body className="mt-2 mb-8">
              This information generates a preliminary risk indication for heart disease, diabetes and hypertension.
              It does not replace a medical diagnosis. Only age and sex are required — leave anything else blank if
              you don&apos;t have it on hand.
            </Body>

            <ProgressSteps steps={STEPS} currentIndex={step} />

            <Card className="mt-6 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  {step === 0 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Age" required>
                        <TextInput type="number" required value={form.age} onChange={(e) => update("age", Number(e.target.value))} />
                      </Field>
                      <Field label="Sex" required helper="Used across all three risk models.">
                        <SelectInput value={form.sex} onChange={(e) => update("sex", e.target.value as HealthIntake["sex"])}>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </SelectInput>
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Systolic blood pressure" helper="mmHg — the top number on a BP reading">
                        <TextInput {...numberField("systolic_bp")} placeholder="e.g. 120" />
                      </Field>
                      <Field label="Total cholesterol" helper="mg/dL">
                        <TextInput {...numberField("cholesterol")} placeholder="e.g. 190" />
                      </Field>
                      <Field label="Blood glucose" helper="mg/dL">
                        <TextInput {...numberField("blood_glucose_mgdl")} placeholder="e.g. 95" />
                      </Field>
                      <Field label="HbA1c" helper="%">
                        <TextInput {...numberField("hba1c_level", "0.1")} placeholder="e.g. 5.4" />
                      </Field>
                      <Field label="BMI">
                        <TextInput {...numberField("bmi", "0.1")} placeholder="e.g. 24.5" />
                      </Field>
                      <Field label="Max heart rate" helper="bpm during exercise/stress test">
                        <TextInput {...numberField("max_heart_rate")} placeholder="e.g. 150" />
                      </Field>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <p className="mb-5 rounded-lg bg-primary-50 px-3.5 py-2.5 text-xs leading-relaxed text-primary-800">
                        These findings typically come from a clinician&apos;s exam (ECG, stress test, angiography)
                        rather than self-report. Leave them blank if you don&apos;t have them — a nurse or doctor
                        can fill them in later.
                      </p>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Chest pain type">
                          <SelectInput {...selectIntField("chest_pain_type")}>
                            <option value="">Unknown</option>
                            <option value={0}>Typical angina</option>
                            <option value={1}>Atypical angina</option>
                            <option value={2}>Non-anginal pain</option>
                            <option value={3}>Asymptomatic</option>
                          </SelectInput>
                        </Field>
                        <Field label="Resting ECG">
                          <SelectInput {...selectIntField("resting_ecg")}>
                            <option value="">Unknown</option>
                            <option value={0}>Normal</option>
                            <option value={1}>ST-T wave abnormality</option>
                            <option value={2}>Left ventricular hypertrophy</option>
                          </SelectInput>
                        </Field>
                        <Field label="ST slope (exercise)">
                          <SelectInput {...selectIntField("st_slope")}>
                            <option value="">Unknown</option>
                            <option value={0}>Upsloping</option>
                            <option value={1}>Flat</option>
                            <option value={2}>Downsloping</option>
                          </SelectInput>
                        </Field>
                        <Field label="ST depression" helper="oldpeak">
                          <TextInput {...numberField("st_depression", "0.1")} />
                        </Field>
                        <Field label="Major vessels colored" helper="0-4, via fluoroscopy">
                          <SelectInput {...selectIntField("major_vessels_colored")}>
                            <option value="">Unknown</option>
                            {[0, 1, 2, 3, 4].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                        <Field label="Thalassemia">
                          <SelectInput {...selectIntField("thalassemia")}>
                            <option value="">Unknown</option>
                            <option value={1}>Normal</option>
                            <option value={2}>Fixed defect</option>
                            <option value={3}>Reversible defect</option>
                          </SelectInput>
                        </Field>
                        <div className="sm:col-span-2">
                          <Checkbox label="Exercise-induced chest pain (angina)" {...checkboxField("exercise_angina")} />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Smoking history" className="sm:col-span-2">
                        <SelectInput
                          value={form.smoking_history ?? ""}
                          onChange={(e) => update("smoking_history", (e.target.value || undefined) as HealthIntake["smoking_history"])}
                        >
                          <option value="">Unknown</option>
                          <option value="never">Never smoked</option>
                          <option value="current">Current smoker</option>
                          <option value="former">Former smoker</option>
                          <option value="ever">Smoked at some point</option>
                          <option value="not current">Not currently smoking</option>
                        </SelectInput>
                      </Field>
                      <Checkbox label="Drinks alcohol" {...checkboxField("drinks_alcohol")} />
                      <Checkbox label="Physically active" {...checkboxField("physically_active")} />
                      <Checkbox label="Diagnosed with hypertension" {...checkboxField("has_hypertension")} />
                      <Checkbox label="Diagnosed with heart disease" {...checkboxField("has_heart_disease")} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && <p className="mt-5 text-sm font-medium text-danger-600">{error}</p>}

              <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-5">
                <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  ← Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>Next →</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Analyzing..." : "Get my risk assessment"}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <PageTitle>Your Risk Assessment</PageTitle>
            <Body className="mt-2 mb-8">
              Statistical estimates from models trained on health data — not a diagnosis. Share these results with a
              doctor for a full clinical picture.
            </Body>

            <div className="grid gap-4 sm:grid-cols-3">
              {result.results.map((r, i) => {
                const meta = CONDITION_META[r.condition];
                return (
                  <motion.div
                    key={r.condition}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.1 }}
                  >
                    <Card
                      className={`h-full ${r.risk_class === "elevated" ? "ring-1 ring-danger-100" : "ring-1 ring-success-100"}`}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <p className="text-sm font-semibold text-neutral-900">{meta.label}</p>
                        <RiskBadge level={r.risk_class} />
                      </div>
                      <p className="mb-4 text-4xl font-bold text-neutral-900">
                        <CountUp value={r.risk_score * 100} decimals={0} suffix="%" duration={1.1} />
                      </p>
                      <p className="text-xs leading-relaxed text-neutral-500">{meta.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>
              {result.any_elevated ? (
                <Card className="mt-6 border-danger-100 bg-danger-50/50">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <SectionHeader>One or more indications are elevated</SectionHeader>
                      <Body className="mt-1.5">
                        This isn&apos;t a diagnosis, but it&apos;s worth talking to a doctor. Booking a
                        teleconsultation is quick and lets a clinician review these results with you.
                      </Body>
                    </div>
                    <LinkButton href="/patient/appointments" className="flex-none">
                      Book a consultation →
                    </LinkButton>
                  </div>
                </Card>
              ) : (
                <Card className="mt-6 border-success-100 bg-success-50/50">
                  <SectionHeader>Your results look good</SectionHeader>
                  <Body className="mt-1.5">
                    No elevated indications this time. Keep up with regular check-ins — you can retake this
                    assessment any time your health information changes.
                  </Body>
                </Card>
              )}
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={startOver}>
                Take assessment again
              </Button>
              <Link href="/patient/history" className="inline-flex items-center px-1 text-sm font-medium text-primary-700 hover:underline">
                View in history →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
