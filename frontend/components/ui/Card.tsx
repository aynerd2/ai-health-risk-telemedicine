"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  padded?: boolean;
}

export function Card({ padded = true, className = "", children, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-xl border border-neutral-200 bg-white shadow-soft ${padded ? "p-5 sm:p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PageTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h1 className={`text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl ${className}`}>{children}</h1>;
}

export function SectionHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-base font-semibold text-neutral-900 sm:text-lg ${className}`}>{children}</h2>;
}

export function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm leading-relaxed text-neutral-600 ${className}`}>{children}</p>;
}

export function Caption({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs text-neutral-500 ${className}`}>{children}</p>;
}
