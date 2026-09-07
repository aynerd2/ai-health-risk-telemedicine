"use client";

import { motion } from "framer-motion";

/**
 * Next.js remounts template.tsx on every navigation (unlike layout.tsx),
 * so this gives every authenticated page a fade + slight upward slide on
 * route change without each page needing its own wrapper — the sidebar in
 * layout.tsx stays mounted and doesn't replay the animation.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
