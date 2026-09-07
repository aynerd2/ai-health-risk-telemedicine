"use client";

import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    title: "AI risk assessment",
    description: "Get an instant statistical risk indication for heart disease, diabetes and hypertension from a short intake form.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Teleconsultation",
    description: "Book time with an approved doctor and discuss your results over live chat and video.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Your history, always on hand",
    description: "Every assessment and consultation lives in one timeline you can revisit any time.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export default function HomePage() {
  return (
    <main className="auth-backdrop min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="mb-4 flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-xs font-medium text-primary-800">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
          Statistical estimates, not a diagnosis
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="max-w-2xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
        >
          Know your risk. Talk to a doctor. All in one place.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600"
        >
          Secure registration, AI-generated risk indications for heart disease, diabetes and hypertension, and
          remote consultation with a real doctor — in one platform.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="mt-8 flex gap-3">
          <LinkButton href="/register" size="lg">
            Get started
          </LinkButton>
          <LinkButton href="/login" variant="secondary" size="lg">
            Log in
          </LinkButton>
        </motion.div>

        <div className="mt-20 grid w-full gap-4 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}>
              <Card className="h-full text-left">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <p className="mb-1.5 text-sm font-semibold text-neutral-900">{f.title}</p>
                <p className="text-xs leading-relaxed text-neutral-500">{f.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
