"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { api, Appointment } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function DoctorDashboard() {
  const { ready } = useAuthGuard("doctor");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  function refresh() {
    api
      .myAppointments()
      .then(setAppointments)
      .catch(() => setAppointments([]));
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
  }, [ready]);

  async function handleStatus(apptId: number, status: "confirmed" | "cancelled") {
    setError(null);
    try {
      await api.updateAppointmentStatus(apptId, status);
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      if (message.toLowerCase().includes("pending admin approval")) {
        setPendingApproval(true);
      } else {
        setError(message);
      }
    }
  }

  if (!ready) return null;

  return (
    <DashboardShell title="Doctor Dashboard">
      {pendingApproval && (
        <p className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Your doctor account is pending admin approval. You can view appointments, but confirming or completing
          them will be enabled once an administrator approves your account.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <h2 className="mb-2 font-medium">Appointments</h2>
      <ul className="flex flex-col gap-2">
        {appointments.map((a) => (
          <li key={a.appt_id} className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm">
            <div>
              <p>{new Date(a.date_time).toLocaleString()}</p>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">{a.status}</span>
            </div>
            <div className="flex gap-3">
              {a.status === "pending" && (
                <>
                  <button onClick={() => handleStatus(a.appt_id, "confirmed")} className="text-blue-600 hover:underline">
                    Confirm
                  </button>
                  <button onClick={() => handleStatus(a.appt_id, "cancelled")} className="text-red-600 hover:underline">
                    Decline
                  </button>
                </>
              )}
              {(a.status === "confirmed" || a.status === "completed") && (
                <Link href={`/doctor/consultation/${a.appt_id}`} className="text-blue-600 hover:underline">
                  {a.status === "completed" ? "View notes" : "Join"}
                </Link>
              )}
            </div>
          </li>
        ))}
        {appointments.length === 0 && <li className="text-sm text-gray-500">No appointments yet.</li>}
      </ul>
    </DashboardShell>
  );
}
