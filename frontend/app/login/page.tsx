"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/FormField";
import { AuthCard } from "@/components/shell/AuthCard";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailError = touched.email && email.length > 0 && !EMAIL_RE.test(email) ? "Enter a valid email address" : undefined;
  const passwordError = touched.password && password.length === 0 ? "Password is required" : undefined;
  const canSubmit = EMAIL_RE.test(email) && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { role } = await api.login(email, password);
      router.push(`/${role}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary-700 hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email" required error={emailError}>
          <TextInput
            type="email"
            required
            value={email}
            error={emailError}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" required error={passwordError}>
          <TextInput
            type="password"
            required
            value={password}
            error={passwordError}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            placeholder="••••••••"
          />
        </Field>
        {error && <p className="text-sm font-medium text-danger-600">{error}</p>}
        <Button type="submit" disabled={loading || !canSubmit} className="mt-1 w-full">
          {loading ? "Logging in..." : "Log in"}
        </Button>
        <Link href="/forgot-password" className="text-center text-sm text-neutral-500 hover:text-primary-700 hover:underline">
          Forgot password?
        </Link>
      </form>
    </AuthCard>
  );
}
