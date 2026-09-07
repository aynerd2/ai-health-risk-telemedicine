"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

/** Animates a number counting up from 0 to `value` on mount. */
export function CountUp({ value, suffix = "", decimals = 0, duration = 1 }: { value: number; suffix?: string; decimals?: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      {display.toFixed(decimals)}
      {suffix}
    </>
  );
}
