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

export default function PatientConsultationPage() {
  const { ready } = useAuthGuard("patient");
  const params = useParams<{ apptId: string }>();
  const apptId = Number(params.apptId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    if (!ready) return;
    api
      .getConsultation(apptId)
      .then(setConsultation)
      .catch(() => setConsultation(null));
  }, [ready, apptId]);

  useEffect(() => {
    if (!ready) return;
    const socket = new WebSocket(api.consultationSocketUrl(apptId, "patient"));
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

  if (!ready) return null;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <Link href="/patient/appointments" className="text-sm text-gray-500 hover:underline">
        &larr; Back to appointments
      </Link>
      <h1 className="text-2xl font-semibold">Consultation — Appointment #{apptId}</h1>

      <div className="flex h-56 items-center justify-center rounded-lg bg-gray-900 text-sm text-gray-300">
        Video call widget (managed WebRTC provider) goes here
      </div>

      <div className="flex h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === "patient" ? "text-right" : "text-left"}>
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

      {consultation && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="mb-3 font-semibold">Consultation notes</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div>
              <dt className="text-gray-500">Notes</dt>
              <dd>{consultation.notes || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Diagnosis</dt>
              <dd>{consultation.diagnosis || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Prescribed action</dt>
              <dd>{consultation.prescribed_action || "—"}</dd>
            </div>
          </dl>
        </div>
      )}
    </main>
  );
}
