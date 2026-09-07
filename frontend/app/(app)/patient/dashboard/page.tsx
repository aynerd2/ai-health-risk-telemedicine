"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Body, Card, PageTitle, SectionHeader } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LinkButton } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Spinner";
import { api, CurrentUser, HealthRecordHistory } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

const ACTIONS = [
  {
    href: "/patient/intake",
    title: "Risk Assessment",
    description: "Answer a few questions about your health to get an instant risk indication.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    href: "/patient/appointments",
    title: "Appointments",
    description: "Book a teleconsultation with an approved doctor, or manage upcoming visits.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    href: "/patient/history",
    title: "History",
    description: "Review past risk assessments and consultation notes over time.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const CONDITION_LABEL: Record<string, string> = {
  heart_disease: "Heart disease",
  diabetes: "Diabetes",
  hypertension: "Hypertension",
};

export default function PatientDashboard() {
  const { ready } = useAuthGuard("patient");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [latest, setLatest] = useState<HealthRecordHistory | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    api.me().then(setUser).catch(() => setUser(null));
    api
      .myPredictionHistory()
      .then((history) => setLatest(history[0] ?? null))
      .catch(() => setLatest(null));
  }, [ready]);

  if (!ready) return null;

  return (
    <div>
      <PageTitle>{user ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Welcome back"}</PageTitle>
      <Body className="mt-2">Here&apos;s a snapshot of your health overview.</Body>

      <div className="mt-8">
        {latest === undefined && <SkeletonCard />}

        {latest === null && (
          <Card className="bg-primary-700 text-white shadow-soft-lg">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <SectionHeader className="text-white">Get your risk assessment</SectionHeader>
                <p className="mt-1.5 max-w-md text-sm text-primary-100">
                  You haven&apos;t submitted a health intake yet. It takes a few minutes and gives you an instant risk
                  indication for heart disease, diabetes and hypertension.
                </p>
              </div>
              <LinkButton href="/patient/intake" variant="secondary" className="flex-none !bg-white !text-primary-800 hover:!bg-primary-50">
                Start assessment →
              </LinkButton>
            </div>
          </Card>
        )}

        {latest && (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader>Your most recent results</SectionHeader>
              <Link href="/patient/history" className="text-xs font-medium text-primary-700 hover:underline">
                View history →
              </Link>
            </div>
            <p className="mb-4 text-xs text-neutral-500">{new Date(latest.date_recorded).toLocaleString()}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {latest.predictions.map((p) => (
                <div key={p.prediction_id} className="rounded-lg border border-neutral-200 p-3">
                  <p className="mb-2 text-xs font-medium text-neutral-500">{CONDITION_LABEL[p.condition]}</p>
                  <RiskBadge level={p.risk_class} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <SectionHeader className="mb-4 mt-10">Quick actions</SectionHeader>
      <div className="grid gap-4 sm:grid-cols-3">
        {ACTIONS.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
          >
            <Link href={action.href} className="group block h-full">
              <Card className="h-full transition-shadow hover:shadow-soft-lg">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                </div>
                <p className="mb-1 text-sm font-semibold text-neutral-900">{action.title}</p>
                <p className="text-xs leading-relaxed text-neutral-500">{action.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
