"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Body, Card, PageTitle, SectionHeader } from "@/components/ui/Card";
import { Field, SelectInput, TextInput } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/RiskBadge";
import { SkeletonCard } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, Appointment, Doctor } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function PatientAppointmentsPage() {
  const { ready } = useAuthGuard("patient");
  const toast = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
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
      toast.success("Appointment booked.");
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
      toast.info("Appointment cancelled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  if (!ready) return null;

  return (
    <div>
      <PageTitle>Appointments</PageTitle>
      <Body className="mt-2">Book a teleconsultation, or manage appointments you already have.</Body>

      <Card className="mt-8">
        <SectionHeader className="mb-5">Book a teleconsultation</SectionHeader>
        {doctors.length === 0 ? (
          <p className="text-sm text-neutral-500">No approved doctors are available to book yet.</p>
        ) : (
          <form onSubmit={handleBook} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Field label="Doctor" className="flex-1">
              <SelectInput value={doctorId ?? ""} onChange={(e) => setDoctorId(Number(e.target.value))}>
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>
                    {d.full_name}
                    {d.specialty ? ` — ${d.specialty}` : ""}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Date & time" className="flex-1">
              <TextInput type="datetime-local" required value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
            </Field>
            <Button type="submit" disabled={booking} className="sm:flex-none">
              {booking ? "Booking..." : "Book"}
            </Button>
          </form>
        )}
        {error && <p className="mt-3 text-sm font-medium text-danger-600">{error}</p>}
      </Card>

      <SectionHeader className="mb-4 mt-10">My appointments</SectionHeader>
      {appointments === null && (
        <div className="grid gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
      {appointments && appointments.length === 0 && (
        <Card>
          <p className="text-sm text-neutral-500">No appointments yet — book one above.</p>
        </Card>
      )}
      {appointments && appointments.length > 0 && (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {appointments.map((a, i) => (
              <motion.div
                key={a.appt_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <Card padded={false} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{new Date(a.date_time).toLocaleString()}</p>
                    <div className="mt-1.5">
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-4">
                    {(a.status === "confirmed" || a.status === "completed") && (
                      <Link href={`/patient/consultation/${a.appt_id}`} className="text-sm font-medium text-primary-700 hover:underline">
                        {a.status === "completed" ? "View notes" : "Join"}
                      </Link>
                    )}
                    {(a.status === "pending" || a.status === "confirmed") && (
                      <button
                        onClick={() => handleCancel(a.appt_id)}
                        className="text-sm font-medium text-danger-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
