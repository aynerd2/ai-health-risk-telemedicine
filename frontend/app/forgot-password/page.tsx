"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/FormField";
import { AuthCard } from "@/components/shell/AuthCard";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetToken(null);
    setLoading(true);
    try {
      const { reset_token } = await api.forgotPassword(email);
      setResetToken(reset_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="No email service is configured for this prototype, so the reset token is shown below instead of emailed."
      footer={
        <Link href="/login" className="font-medium text-primary-700 hover:underline">
          ← Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email" required>
          <TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        {error && <p className="text-sm font-medium text-danger-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Requesting..." : "Send reset link"}
        </Button>
      </form>

      {resetToken !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
          {resetToken ? (
            <>
              <p className="mb-2 text-neutral-600">Reset token (valid for 30 minutes):</p>
              <p className="mb-3 break-all rounded-md bg-white px-2.5 py-2 font-mono text-xs text-neutral-700 ring-1 ring-neutral-200">{resetToken}</p>
              <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="font-medium text-primary-700 hover:underline">
                Continue to reset password →
              </Link>
            </>
          ) : (
            <p className="text-neutral-600">If that email is registered, a reset link would have been sent.</p>
          )}
        </motion.div>
      )}
    </AuthCard>
  );
}
