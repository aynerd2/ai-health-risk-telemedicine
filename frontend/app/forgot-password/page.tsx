"use client";

import Link from "next/link";
import { useState } from "react";
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
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="mb-2 text-2xl font-semibold">Forgot password</h1>
      <p className="mb-6 text-sm text-gray-600">
        Enter your account email. No email service is configured for this prototype, so the reset link is shown
        directly below instead of being sent to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Requesting..." : "Send reset link"}
        </button>
      </form>

      {resetToken !== null && (
        <div className="mt-6 rounded border border-gray-200 p-4 text-sm">
          {resetToken ? (
            <>
              <p className="mb-2 text-gray-600">Reset token (valid for 30 minutes):</p>
              <p className="mb-3 break-all rounded bg-gray-50 p-2 font-mono text-xs">{resetToken}</p>
              <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="text-blue-600 hover:underline">
                Continue to reset password &rarr;
              </Link>
            </>
          ) : (
            <p className="text-gray-600">If that email is registered, a reset link would have been sent.</p>
          )}
        </div>
      )}
    </main>
  );
}
