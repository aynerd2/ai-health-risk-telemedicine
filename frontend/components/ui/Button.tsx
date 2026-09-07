"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-primary-700 text-white hover:bg-primary-800 focus-visible:outline-primary-700 disabled:bg-primary-300",
  secondary:
    "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus-visible:outline-primary-700 disabled:text-neutral-400",
  ghost: "text-neutral-600 hover:bg-neutral-100 focus-visible:outline-primary-700 disabled:text-neutral-300",
  danger: "bg-danger-600 text-white hover:bg-danger-700 focus-visible:outline-danger-600 disabled:bg-danger-300",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium shadow-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:shadow-none";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={props.disabled ? undefined : { y: -1 }}
        whileTap={props.disabled ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className={`${BASE} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} className="inline-block">
      <Link href={href} className={`${BASE} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}>
        {children}
      </Link>
    </motion.div>
  );
}
