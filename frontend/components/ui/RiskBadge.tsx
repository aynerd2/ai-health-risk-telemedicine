"use client";

import { motion } from "framer-motion";

export function RiskBadge({ level, className = "" }: { level: "low" | "elevated"; className?: string }) {
  const isElevated = level === "elevated";
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isElevated
          ? "animate-pulse-glow-danger bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-200"
          : "bg-success-50 text-success-700 ring-1 ring-inset ring-success-200"
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isElevated ? "bg-danger-500" : "bg-success-500"}`} />
      {isElevated ? "Elevated" : "Low"}
    </motion.span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-primary-50 text-primary-700 ring-primary-200",
    completed: "bg-success-50 text-success-700 ring-success-200",
    cancelled: "bg-neutral-100 text-neutral-500 ring-neutral-200",
    active: "bg-success-50 text-success-700 ring-success-200",
    inactive: "bg-neutral-100 text-neutral-500 ring-neutral-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        styles[status] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200"
      }`}
    >
      {status}
    </span>
  );
}
