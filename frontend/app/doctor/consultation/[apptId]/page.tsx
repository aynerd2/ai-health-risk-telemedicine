"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Consultation } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

interface ChatMessage {
  sender: string;
  message: string;
}

export default function DoctorConsultationPage() {
  const { ready } = useAuthGuard("doctor");
  const params = useParams<{ apptId: string }>();
  const apptId = Number(params.apptId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  const [existing, setExisting] = useState<Consultation | null>(null);
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescribedAction, setPrescribedAction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    api
      .getConsultation(apptId)
      .then(setExisting)
      .catch(() => setExisting(null));
  }, [ready, apptId]);

  useEffect(() => {
    if (!ready) return;
    const socket = new WebSocket(api.consultationSocketUrl(apptId, "doctor"));
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ChatMessage;
      setMessages((prev) => [...prev, data]);
    };
    socketRef.current = socket;
    return () => socket.close();
  }, [ready, apptId]);

  function sendMessage() {
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.send(draft);
    setDraft("");
  }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save consultation notes");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <Link href="/doctor/dashboard" className="text-sm text-gray-500 hover:underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-2xl font-semibold">Consultation — Appointment #{apptId}</h1>

      {/* Video call placeholder: embed a managed WebRTC provider's widget/iframe here
          (e.g. Daily.co's <iframe> or SDK component). The FastAPI backend does not
          relay video/audio — see Section 3.2.8. */}
      <div className="flex h-56 items-center justify-center rounded-lg bg-gray-900 text-sm text-gray-300">
        Video call widget (managed WebRTC provider) goes here
      </div>

      <div className="flex h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === "doctor" ? "text-right" : "text-left"}>
            <span className="inline-block rounded bg-gray-100 px-2 py-1 text-sm">
              <strong>{m.sender}:</strong> {m.message}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button onClick={sendMessage} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Send
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="mb-3 font-semibold">Consultation notes</h2>
        {existing ? (
          <dl className="flex flex-col gap-2 text-sm">
            <div>
              <dt className="text-gray-500">Notes</dt>
              <dd>{existing.notes || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Diagnosis</dt>
              <dd>{existing.diagnosis || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Prescribed action</dt>
              <dd>{existing.prescribed_action || "—"}</dd>
            </div>
          </dl>
        ) : (
          <form onSubmit={handleSaveNotes} className="flex flex-col gap-3">
            <label className="flex flex-col text-sm">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 rounded border border-gray-300 px-3 py-2"
                rows={3}
              />
            </label>
            <label className="flex flex-col text-sm">
              Diagnosis
              <input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="mt-1 rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm">
              Prescribed action
              <input
                value={prescribedAction}
                onChange={(e) => setPrescribedAction(e.target.value)}
                className="mt-1 rounded border border-gray-300 px-3 py-2"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & complete appointment"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
