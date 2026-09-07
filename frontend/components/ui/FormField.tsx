"use client";

import { useState } from "react";

const baseInput =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-soft transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/30";

function borderClass(error?: string, touched?: boolean) {
  return error && touched ? "border-danger-400 focus:border-danger-500" : "border-neutral-300 focus:border-primary-600";
}

export function Field({
  label,
  htmlFor,
  helper,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="font-medium text-neutral-800">
        {label}
        {required && <span className="ml-0.5 text-primary-600">*</span>}
      </span>
      {children}
      {helper && !error && <span className="text-xs text-neutral-500">{helper}</span>}
      {error && <span className="text-xs font-medium text-danger-600">{error}</span>}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }
) {
  const [touched, setTouched] = useState(false);
  const { error, className = "", onBlur, ...rest } = props;
  return (
    <input
      {...rest}
      onBlur={(e) => {
        setTouched(true);
        onBlur?.(e);
      }}
      className={`${baseInput} ${borderClass(error, touched)} ${className}`}
    />
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
) {
  const { error, className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`${baseInput} ${borderClass(error, true)} ${className}`}>
      {children}
    </select>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  const { error, className = "", ...rest } = props;
  return <textarea {...rest} className={`${baseInput} ${borderClass(error, true)} ${className}`} />;
}

export function Checkbox({ label, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700 ${className}`}>
      <input
        type="checkbox"
        {...rest}
        className="h-4 w-4 rounded border-neutral-300 text-primary-700 focus:ring-2 focus:ring-primary-600/30"
      />
      {label}
    </label>
  );
}
