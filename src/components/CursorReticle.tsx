"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Global JARVIS-style cursor reticle — follows the mouse on every page with a
 * spring lag, and "locks on" (grows + turns gold) over interactive elements.
 * Desktop only; disabled under prefers-reduced-motion.
 */
export default function CursorReticle() {
  const reduceMotion = useReducedMotion();
  const [locked, setLocked] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const rx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null;
      setLocked(
        !!el?.closest?.("a, button, input, textarea, select, [data-hud-lock]")
      );
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [reduceMotion, x, y]);

  if (reduceMotion) return null;

  return (
    <motion.div
      style={{ x: rx, y: ry }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      aria-hidden
    >
      <motion.div
        animate={{ scale: locked ? 1.45 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`-translate-x-1/2 -translate-y-1/2 ${
          locked ? "text-amber-400" : "text-cyan-400"
        }`}
      >
        <svg width="58" height="58" viewBox="0 0 58 58" className="hud-glow">
          <g className="hud-spin-rev" style={{ transformOrigin: "29px 29px" }}>
            <circle
              cx="29"
              cy="29"
              r="23"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5 9"
              opacity="0.9"
            />
          </g>
          <circle
            cx="29"
            cy="29"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.45"
          />
          <line x1="29" y1="2" x2="29" y2="11" stroke="currentColor" strokeWidth="1" />
          <line x1="29" y1="47" x2="29" y2="56" stroke="currentColor" strokeWidth="1" />
          <line x1="2" y1="29" x2="11" y2="29" stroke="currentColor" strokeWidth="1" />
          <line x1="47" y1="29" x2="56" y2="29" stroke="currentColor" strokeWidth="1" />
          <circle cx="29" cy="29" r="2" fill="currentColor" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
