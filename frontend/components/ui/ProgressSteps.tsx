"use client";

import { motion } from "framer-motion";

export function ProgressSteps({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <div className="mb-2">
      <div className="mb-2 flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step} className={`flex flex-1 items-center ${i < steps.length - 1 ? "" : "flex-none"}`}>
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  backgroundColor: i <= currentIndex ? "#0F766E" : "#F5F5F4",
                  color: i <= currentIndex ? "#ffffff" : "#78716C",
                  scale: i === currentIndex ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-neutral-200 text-xs font-semibold"
              >
                {i < currentIndex ? "✓" : i + 1}
              </motion.div>
              <span className={`hidden text-center text-[11px] font-medium sm:block ${i <= currentIndex ? "text-primary-800" : "text-neutral-400"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-1.5 h-0.5 flex-1 overflow-hidden rounded bg-neutral-200 sm:mx-2">
                <motion.div
                  animate={{ width: i < currentIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-primary-600"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
