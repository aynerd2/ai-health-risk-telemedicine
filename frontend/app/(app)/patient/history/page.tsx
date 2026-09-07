"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Body, Card, PageTitle } from "@/components/ui/Card";
import { RiskBadge, StatusBadge } from "@/components/ui/RiskBadge";
import { SkeletonCard } from "@/components/ui/Spinner";
import { api, Appointment, HealthRecordHistory } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

const CONDITION_LABEL: Record<string, string> = {
  heart_disease: "Heart disease",
  diabetes: "Diabetes",
  hypertension: "Hypertension",
};

type TimelineEntry =
  | { kind: "prediction"; date: string; data: HealthRecordHistory }
  | { kind: "appointment"; date: string; data: Appointment };

export default function PatientHistoryPage() {
  const { ready } = useAuthGuard("patient");
  const [entries, setEntries] = useState<TimelineEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    Promise.all([api.myPredictionHistory(), api.myAppointments()])
      .then(([history, appts]) => {
        const merged: TimelineEntry[] = [
          ...history.map((h): TimelineEntry => ({ kind: "prediction", date: h.date_recorded, data: h })),
          ...appts.map((a): TimelineEntry => ({ kind: "appointment", date: a.date_time, data: a })),
        ];
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(merged);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history"));
  }, [ready]);

  if (!ready) return null;

  return (
    <div>
      <PageTitle>My History</PageTitle>
      <Body className="mt-2">Risk assessments and appointments, most recent first.</Body>

      {error && <p className="mt-6 text-sm font-medium text-danger-600">{error}</p>}

      <div className="mt-8">
        {entries === null && (
          <div className="grid gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {entries && entries.length === 0 && (
          <Card>
            <p className="text-sm text-neutral-500">Nothing here yet — your assessments and appointments will show up on this timeline.</p>
          </Card>
        )}

        {entries && entries.length > 0 && (
          <ol className="relative border-l border-neutral-200 pl-6">
            {entries.map((entry, i) => (
              <motion.li
                key={`${entry.kind}-${entry.kind === "prediction" ? entry.data.record_id : entry.data.appt_id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.4) }}
                className="mb-6 last:mb-0"
              >
                <span
                  className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full ring-4 ring-neutral-50 ${
                    entry.kind === "prediction" ? "bg-primary-600" : "bg-neutral-400"
                  }`}
                />
                <p className="mb-2 text-xs font-medium text-neutral-400">{new Date(entry.date).toLocaleString()}</p>

                {entry.kind === "prediction" ? (
                  <Card>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary-700">Risk assessment</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {entry.data.predictions.map((p) => (
                        <div key={p.prediction_id} className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2">
                          <span className="text-xs font-medium text-neutral-600">{CONDITION_LABEL[p.condition]}</span>
                          <RiskBadge level={p.risk_class} />
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card padded={false} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Appointment</p>
                      <p className="mt-1 text-sm text-neutral-700">Teleconsultation</p>
                    </div>
                    <StatusBadge status={entry.data.status} />
                  </Card>
                )}
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
