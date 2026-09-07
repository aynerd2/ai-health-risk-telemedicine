"use client";

import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function PatientDashboard() {
  const { ready } = useAuthGuard("patient");
  if (!ready) return null;

  return (
    <DashboardShell title="Patient Dashboard">
      <div className="flex flex-col gap-3">
        <Link href="/patient/intake" className="rounded border border-gray-200 p-4 hover:bg-gray-50">
          Submit health information &amp; get a risk prediction
        </Link>
        <Link href="/patient/appointments" className="rounded border border-gray-200 p-4 hover:bg-gray-50">
          Book &amp; manage teleconsultation appointments
        </Link>
        <Link href="/patient/history" className="rounded border border-gray-200 p-4 hover:bg-gray-50">
          View my prediction &amp; consultation history
        </Link>
      </div>
    </DashboardShell>
  );
}
