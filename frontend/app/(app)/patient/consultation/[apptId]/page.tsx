"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/consultation/ChatPanel";
import { VideoPanel } from "@/components/consultation/VideoPanel";
import { Card, PageTitle, SectionHeader } from "@/components/ui/Card";
import { api, Consultation } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function PatientConsultationPage() {
  const { ready } = useAuthGuard("patient");
  const params = useParams<{ apptId: string }>();
  const apptId = Number(params.apptId);
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    if (!ready) return;
    api.getConsultation(apptId).then(setConsultation).catch(() => setConsultation(null));
  }, [ready, apptId]);

  if (!ready) return null;

  return (
    <div>
      <Link href="/patient/appointments" className="mb-4 inline-block text-sm font-medium text-neutral-500 hover:text-neutral-700">
        &larr; Back to appointments
      </Link>
      <PageTitle>Consultation</PageTitle>
      <p className="mt-1 text-sm text-neutral-500">Appointment #{apptId}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <VideoPanel />
          {consultation && (
            <Card>
              <SectionHeader className="mb-4">Consultation notes</SectionHeader>
              <dl className="flex flex-col gap-4 text-sm">
                <div>
                  <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Notes</dt>
                  <dd className="text-neutral-700">{consultation.notes || "—"}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Diagnosis</dt>
                  <dd className="text-neutral-700">{consultation.diagnosis || "—"}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Prescribed action</dt>
                  <dd className="text-neutral-700">{consultation.prescribed_action || "—"}</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
        <ChatPanel apptId={apptId} self="patient" />
      </div>
    </div>
  );
}
