"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Body, Card, PageTitle, SectionHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/RiskBadge";
import { SkeletonCard } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { api, PendingDoctor, PlatformStats, UserAdminRead } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

type PendingAction = { type: "approve"; doctor: PendingDoctor } | { type: "toggle"; user: UserAdminRead };

export default function AdminDashboard() {
  const { ready } = useAuthGuard("admin");
  const toast = useToast();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [pending, setPending] = useState<PendingDoctor[] | null>(null);
  const [users, setUsers] = useState<UserAdminRead[] | null>(null);
  const [confirming, setConfirming] = useState<PendingAction | null>(null);
  const [working, setWorking] = useState(false);

  function refresh() {
    api.admin.stats().then(setStats).catch(() => setStats(null));
    api.admin.pendingDoctors().then(setPending).catch(() => setPending([]));
    api.admin.listUsers().then(setUsers).catch(() => setUsers([]));
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
  }, [ready]);

  async function runConfirmedAction() {
    if (!confirming) return;
    setWorking(true);
    try {
      if (confirming.type === "approve") {
        await api.admin.approveDoctor(confirming.doctor.doctor_id);
        toast.success(`${confirming.doctor.full_name} approved.`);
      } else {
        if (confirming.user.is_active) await api.admin.deactivateUser(confirming.user.user_id);
        else await api.admin.activateUser(confirming.user.user_id);
        toast.success(`${confirming.user.full_name} ${confirming.user.is_active ? "deactivated" : "activated"}.`);
      }
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setWorking(false);
      setConfirming(null);
    }
  }

  if (!ready) return null;

  const statEntries: [string, number][] = stats
    ? [
        ["Patients", stats.total_patients],
        ["Doctors", stats.total_doctors],
        ["Pending approvals", stats.pending_doctor_approvals],
        ["Predictions", stats.total_predictions],
        ["Elevated results", stats.elevated_predictions],
        ["Appointments", stats.total_appointments],
        ["Consultations", stats.completed_consultations],
        ["Total users", stats.total_users],
      ]
    : [];

  return (
    <div>
      <PageTitle>Administrator Dashboard</PageTitle>
      <Body className="mt-2">Manage user accounts, approve doctor registrations, and view platform usage.</Body>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats
          ? statEntries.map(([label, value], i) => <StatCard key={label} label={label} value={value} index={i} />)
          : Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-xl border border-neutral-200 bg-neutral-100" />
            ))}
      </div>

      <SectionHeader className="mb-4 mt-10">Pending doctor approvals</SectionHeader>
      {pending === null && <SkeletonCard />}
      {pending && pending.length === 0 && (
        <Card>
          <p className="text-sm text-neutral-500">No pending approvals right now.</p>
        </Card>
      )}
      {pending && pending.length > 0 && (
        <div className="flex flex-col gap-3">
          {pending.map((d, i) => (
            <motion.div key={d.doctor_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card padded={false} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{d.full_name}</p>
                  <p className="text-xs text-neutral-500">
                    {d.email} {d.specialty ? `· ${d.specialty}` : ""} {d.license_no ? `· License ${d.license_no}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setConfirming({ type: "approve", doctor: d })}
                  className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800 hover:bg-primary-100"
                >
                  Approve
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <SectionHeader className="mb-4 mt-10">All users</SectionHeader>
      {users === null && <SkeletonCard />}
      {users && (
        <div className="flex flex-col gap-2">
          {users.map((u, i) => (
            <motion.div key={u.user_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <Card padded={false} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {u.full_name} <span className="font-normal capitalize text-neutral-400">({u.role})</span>
                  </p>
                  <p className="text-xs text-neutral-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={u.is_active ? "active" : "inactive"} />
                  <button
                    onClick={() => setConfirming({ type: "toggle", user: u })}
                    className="text-xs font-medium text-primary-700 hover:underline"
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirming !== null}
        title={
          confirming?.type === "approve"
            ? `Approve ${confirming.doctor.full_name}?`
            : confirming?.type === "toggle"
              ? `${confirming.user.is_active ? "Deactivate" : "Activate"} ${confirming.user.full_name}?`
              : ""
        }
        description={
          confirming?.type === "approve"
            ? "They'll be able to accept and confirm patient appointments immediately."
            : confirming?.type === "toggle" && confirming.user.is_active
              ? "They will no longer be able to log in until reactivated."
              : "They will be able to log in again."
        }
        confirmLabel={confirming?.type === "approve" ? "Approve" : confirming?.type === "toggle" && confirming.user.is_active ? "Deactivate" : "Activate"}
        danger={confirming?.type === "toggle" && confirming.user.is_active}
        loading={working}
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
