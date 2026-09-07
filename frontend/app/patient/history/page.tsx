"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { api, Appointment, HealthRecordHistory } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function PatientHistoryPage() {
  const { ready } = useAuthGuard("patient");
  const [records, setRecords] = useState<HealthRecordHistory[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([api.myPredictionHistory(), api.myAppointments()])
      .then(([history, appts]) => {
        setRecords(history);
        setAppointments(appts);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <DashboardShell title="My History" links={[{ href: "/patient/dashboard", label: "Back to dashboard" }]}>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && (
        <>
          <section className="mb-10">
            <h2 className="mb-3 font-medium">Risk predictions</h2>
            {records.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
            <ul className="flex flex-col gap-4">
              {records.map((r) => (
                <li key={r.record_id} className="rounded-lg border border-gray-200 p-4">
                  <p className="mb-2 text-xs text-gray-500">{new Date(r.date_recorded).toLocaleString()}</p>
                  <ul className="flex flex-col gap-1">
                    {r.predictions.map((p) => (
                      <li key={p.prediction_id} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{p.condition.replace("_", " ")}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            p.risk_class === "elevated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {p.risk_class} ({Math.round(p.risk_score * 100)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-medium">Appointments</h2>
            {appointments.length === 0 && <p className="text-sm text-gray-500">No appointments yet.</p>}
            <ul className="flex flex-col gap-2">
              {appointments.map((a) => (
                <li key={a.appt_id} className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm">
                  <span>{new Date(a.date_time).toLocaleString()}</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">{a.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </DashboardShell>
  );
}
