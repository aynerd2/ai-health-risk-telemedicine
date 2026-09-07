"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/consultation/ChatPanel";
import { VideoPanel } from "@/components/consultation/VideoPanel";
import { Button } from "@/components/ui/Button";
import { Card, PageTitle, SectionHeader } from "@/components/ui/Card";
import { Field, TextArea, TextInput } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { api, Consultation } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function DoctorConsultationPage() {
  const { ready } = useAuthGuard("doctor");
  const params = useParams<{ apptId: string }>();
  const apptId = Number(params.apptId);
  const toast = useToast();

  const [existing, setExisting] = useState<Consultation | null>(null);
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescribedAction, setPrescribedAction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    api.getConsultation(apptId).then(setExisting).catch(() => setExisting(null));
  }, [ready, apptId]);

  async function handleSaveNotes(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const consult = await api.recordConsultation(apptId, {
        notes: notes || undefined,
        diagnosis: diagnosis || undefined,
        prescribed_action: prescribedAction || undefined,
      });
      setExisting(consult);
      toast.success("Consultation notes saved. Appointment marked complete.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save consultation notes");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <Link href="/doctor/dashboard" className="mb-4 inline-block text-sm font-medium text-neutral-500 hover:text-neutral-700">
        &larr; Back to dashboard
      </Link>
      <PageTitle>Consultation</PageTitle>
      <p className="mt-1 text-sm text-neutral-500">Appointment #{apptId}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <VideoPanel />

          <Card>
            <SectionHeader className="mb-4">Consultation notes</SectionHeader>
            {existing ? (
              <dl className="flex flex-col gap-4 text-sm">
                <div>
                  <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Notes</dt>
                  <dd className="text-neutral-700">{existing.notes || "—"}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Diagnosis</dt>
                  <dd className="text-neutral-700">{existing.diagnosis || "—"}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Prescribed action</dt>
                  <dd className="text-neutral-700">{existing.prescribed_action || "—"}</dd>
                </div>
              </dl>
            ) : (
              <form onSubmit={handleSaveNotes} className="flex flex-col gap-4">
                <Field label="Notes">
                  <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
                <Field label="Diagnosis">
                  <TextInput value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                </Field>
                <Field label="Prescribed action">
                  <TextInput value={prescribedAction} onChange={(e) => setPrescribedAction(e.target.value)} />
                </Field>
                {error && <p className="text-sm font-medium text-danger-600">{error}</p>}
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save & complete appointment"}
                </Button>
              </form>
            )}
          </Card>
        </div>
        <ChatPanel apptId={apptId} self="doctor" />
      </div>
    </div>
  );
}
