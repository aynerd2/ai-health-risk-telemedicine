"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { api, PendingDoctor, PlatformStats, UserAdminRead } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function AdminDashboard() {
  const { ready } = useAuthGuard("admin");
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [pending, setPending] = useState<PendingDoctor[]>([]);
  const [users, setUsers] = useState<UserAdminRead[]>([]);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.admin.stats().then(setStats).catch(() => setStats(null));
    api.admin.pendingDoctors().then(setPending).catch(() => setPending([]));
    api.admin.listUsers().then(setUsers).catch(() => setUsers([]));
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
  }, [ready]);

  async function handleApprove(doctorId: number) {
    setError(null);
    try {
      await api.admin.approveDoctor(doctorId);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    }
  }

  async function handleToggleActive(userId: number, isActive: boolean) {
    setError(null);
    try {
      if (isActive) await api.admin.deactivateUser(userId);
      else await api.admin.activateUser(userId);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (!ready) return null;

  return (
    <DashboardShell title="Administrator Dashboard">
      <p className="mb-6 text-sm text-gray-600">
        Manage user accounts, approve doctor registrations, and view platform usage reports.
      </p>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {stats && (
        <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Patients", stats.total_patients],
            ["Doctors", stats.total_doctors],
            ["Pending approvals", stats.pending_doctor_approvals],
            ["Predictions", stats.total_predictions],
            ["Elevated results", stats.elevated_predictions],
            ["Appointments", stats.total_appointments],
            ["Consultations", stats.completed_consultations],
            ["Total users", stats.total_users],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-xl font-semibold">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-3 font-medium">Pending doctor approvals</h2>
        {pending.length === 0 && <p className="text-sm text-gray-500">No pending approvals.</p>}
        <ul className="flex flex-col gap-2">
          {pending.map((d) => (
            <li key={d.doctor_id} className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm">
              <div>
                <p className="font-medium">{d.full_name}</p>
                <p className="text-gray-500">
                  {d.email} {d.specialty ? `· ${d.specialty}` : ""} {d.license_no ? `· License ${d.license_no}` : ""}
                </p>
              </div>
              <button onClick={() => handleApprove(d.doctor_id)} className="text-blue-600 hover:underline">
                Approve
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-medium">All users</h2>
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li key={u.user_id} className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm">
              <div>
                <p className="font-medium">
                  {u.full_name} <span className="font-normal capitalize text-gray-500">({u.role})</span>
                </p>
                <p className="text-gray-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {u.is_active ? "active" : "inactive"}
                </span>
                <button onClick={() => handleToggleActive(u.user_id, u.is_active)} className="text-blue-600 hover:underline">
                  {u.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}
