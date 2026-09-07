"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { api, Appointment, Doctor } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function PatientAppointmentsPage() {
  const { ready } = useAuthGuard("patient");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  function refreshAppointments() {
    api.myAppointments().then(setAppointments).catch(() => setAppointments([]));
  }

  useEffect(() => {
    if (!ready) return;
    api
      .listDoctors()
      .then((docs) => {
        setDoctors(docs);
        if (docs.length > 0) setDoctorId(docs[0].doctor_id);
      })
      .catch(() => setDoctors([]));
    refreshAppointments();
  }, [ready]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!doctorId || !dateTime) return;
    setBooking(true);
    try {
      await api.bookAppointment(doctorId, new Date(dateTime).toISOString());
      setDateTime("");
      refreshAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel(apptId: number) {
    try {
      await api.cancelAppointment(apptId);
      refreshAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  if (!ready) return null;

  return (
    <DashboardShell title="Appointments" links={[{ href: "/patient/dashboard", label: "Back to dashboard" }]}>
      <section className="mb-10">
        <h2 className="mb-3 font-medium">Book a teleconsultation</h2>
        {doctors.length === 0 ? (
          <p className="text-sm text-gray-500">No approved doctors are available to book yet.</p>
        ) : (
          <form onSubmit={handleBook} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col text-sm">
              Doctor
              <select
                value={doctorId ?? ""}
                onChange={(e) => setDoctorId(Number(e.target.value))}
                className="mt-1 rounded border border-gray-300 px-3 py-2"
              >
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>
                    {d.full_name}
                    {d.specialty ? ` — ${d.specialty}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col text-sm">
              Date &amp; time
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="mt-1 rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={booking}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {booking ? "Booking..." : "Book"}
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section>
        <h2 className="mb-3 font-medium">My appointments</h2>
        {appointments.length === 0 && <p className="text-sm text-gray-500">No appointments yet.</p>}
        <ul className="flex flex-col gap-2">
          {appointments.map((a) => (
            <li key={a.appt_id} className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm">
              <div>
                <p>{new Date(a.date_time).toLocaleString()}</p>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">{a.status}</span>
              </div>
              <div className="flex gap-3">
                {(a.status === "confirmed" || a.status === "completed") && (
                  <Link href={`/patient/consultation/${a.appt_id}`} className="text-blue-600 hover:underline">
                    {a.status === "completed" ? "View notes" : "Join"}
                  </Link>
                )}
                {(a.status === "pending" || a.status === "confirmed") && (
                  <button onClick={() => handleCancel(a.appt_id)} className="text-red-600 hover:underline">
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}
