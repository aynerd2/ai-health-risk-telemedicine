"use client";

import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

export function StatCard({ label, value, index = 0 }: { label: string; value: number; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-soft"
    >
      <p className="text-2xl font-bold text-primary-800">
        <CountUp value={value} />
      </p>
      <p className="mt-1 text-xs font-medium text-neutral-500">{label}</p>
    </motion.div>
  );
}
