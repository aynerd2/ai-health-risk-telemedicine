"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="auth-backdrop flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-sm font-bold text-white">H</div>
          <span className="text-sm font-semibold text-neutral-900">HealthPredict</span>
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-soft-lg sm:p-8">
          <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-neutral-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-neutral-500">{footer}</div>}
      </motion.div>
    </main>
  );
}
