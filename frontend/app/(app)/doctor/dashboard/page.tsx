"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, PageTitle, SectionHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/RiskBadge";
import { SkeletonCard } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, Appointment } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function DoctorDashboard() {
  const { ready } = useAuthGuard("doctor");
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
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
    try {
      await api.updateAppointmentStatus(apptId, status);
      refresh();
      toast.success(status === "confirmed" ? "Appointment confirmed." : "Appointment declined.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      if (message.toLowerCase().includes("pending admin approval")) {
        setPendingApproval(true);
      } else {
        toast.error(message);
      }
    }
  }

  const sorted = useMemo(
    () => (appointments ?? []).slice().sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()),
    [appointments]
  );

  if (!ready) return null;

  return (
    <div>
      <PageTitle>Doctor Dashboard</PageTitle>
      <p className="mt-2 text-sm text-neutral-600">Your upcoming teleconsultation appointments.</p>

      <AnimatePresence>
        {pendingApproval && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6">
            <Card className="border-amber-200 bg-amber-50">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <SectionHeader>Your account is pending admin approval</SectionHeader>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                    You can view your appointments, but confirming or completing them will be enabled once an
                    administrator approves your account. This is usually quick — check back soon.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader className="mb-4 mt-8">Appointments</SectionHeader>

      {appointments === null && (
        <div className="grid gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {appointments && sorted.length === 0 && (
        <Card>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">No appointments yet</p>
            <p className="max-w-xs text-xs text-neutral-500">
              When a patient books a teleconsultation with you, it will show up here for you to confirm.
            </p>
          </div>
        </Card>
      )}

      {appointments && sorted.length > 0 && (
        <div className="flex flex-col gap-3">
          {sorted.map((a, i) => (
            <motion.div key={a.appt_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}>
              <Card padded={false} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{new Date(a.date_time).toLocaleString()}</p>
                  <div className="mt-1.5">
                    <StatusBadge status={a.status} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleStatus(a.appt_id, "confirmed")}>
                        Confirm
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleStatus(a.appt_id, "cancelled")}>
                        Decline
                      </Button>
                    </>
                  )}
                  {(a.status === "confirmed" || a.status === "completed") && (
                    <Link href={`/doctor/consultation/${a.appt_id}`}>
                      <Button size="sm" variant={a.status === "completed" ? "secondary" : "primary"}>
                        {a.status === "completed" ? "View notes" : "Join consultation"}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
