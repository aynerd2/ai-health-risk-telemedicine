"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/FormField";
import { AuthCard } from "@/components/shell/AuthCard";
import { api, UserRole } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameError = touched.fullName && fullName.trim().length === 0 ? "Full name is required" : undefined;
  const emailError = touched.email && email.length > 0 && !EMAIL_RE.test(email) ? "Enter a valid email address" : undefined;
  const passwordError = touched.password && password.length > 0 && password.length < 8 ? "At least 8 characters" : undefined;
  const canSubmit = fullName.trim().length > 0 && EMAIL_RE.test(email) && password.length >= 8;

  function markTouched(field: keyof typeof touched) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.register({ full_name: fullName, email, password, role });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Get started with your free account"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full name" required error={nameError}>
          <TextInput
            required
            value={fullName}
            error={nameError}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => markTouched("fullName")}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email" required error={emailError}>
          <TextInput
            type="email"
            required
            value={email}
            error={emailError}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched("email")}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" required error={passwordError} helper={!passwordError ? "At least 8 characters" : undefined}>
          <TextInput
            type="password"
            required
            minLength={8}
            value={password}
            error={passwordError}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markTouched("password")}
            placeholder="••••••••"
          />
        </Field>
        <Field label="I am a" required>
          <SelectInput value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            {/*
              TEMPORARY — REMOVE AFTER THE FIRST ADMIN IS CREATED.
              The backend only accepts role="admin" here when zero admin
              accounts exist yet (see app/routers/auth.py's register()) — so
              this option stops doing anything the moment that first admin
              is registered. Leaving it in the dropdown after that isn't a
              security hole, just UI clutter that shouldn't ship. Delete
              this <option> once you've registered the one admin account.
            */}
            <option value="admin">Admin (temporary — remove after first use)</option>
          </SelectInput>
        </Field>
        {error && <p className="text-sm font-medium text-danger-600">{error}</p>}
        <Button type="submit" disabled={loading || !canSubmit} className="mt-1 w-full">
          {loading ? "Creating account..." : "Register"}
        </Button>
      </form>
    </AuthCard>
  );
}
