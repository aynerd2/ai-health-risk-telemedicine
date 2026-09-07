"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-soft-lg"
          >
            <h3 className="mb-2 text-base font-semibold text-neutral-900">{title}</h3>
            <p className="mb-6 text-sm text-neutral-600">{description}</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm} disabled={loading}>
                {loading ? "Working..." : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
