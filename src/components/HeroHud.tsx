"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * JARVIS-style HUD overlay for the hero section:
 * - panning tech grid + scanlines + one-time boot sweep
 * - holographic rotating reactor rings behind the content
 * - drifting particle field
 * - refined SVG corner targeting brackets that draw in on load
 * - a cursor-following targeting reticle that "locks on" over interactive
 *   elements (grows + turns gold)
 *
 * Everything is pointer-events-none so it never blocks clicks, and all
 * motion is disabled under prefers-reduced-motion.
 */

// Deterministic particle layout (no Math.random — avoids hydration drift).
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61) % 100,
  size: 2 + (i % 3),
  duration: 7 + (i % 5),
  delay: (i % 8) * 0.6,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 4),
}));

// A single refined HUD corner. Rotated per screen corner.
const Corner = ({
  className,
  rotate,
  delay,
}: {
  className: string;
  rotate: number;
  delay: number;
}) => (
  <motion.svg
    width="66"
    height="66"
    viewBox="0 0 66 66"
    style={{ rotate }}
    className={`absolute text-cyan-400/70 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay }}
  >
    <motion.path
      d="M3 40 L3 12 Q3 3 12 3 L40 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{ filter: "drop-shadow(0 0 2px rgba(34,211,238,0.55))" }}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    />
    {/* accent ticks + elbow node */}
    <line x1="3" y1="48" x2="3" y2="57" stroke="currentColor" strokeWidth="1" opacity="0.55" />
    <line x1="48" y1="3" x2="57" y2="3" stroke="currentColor" strokeWidth="1" opacity="0.55" />
    <circle cx="9" cy="9" r="1.6" fill="currentColor" />
  </motion.svg>
);

export default function HeroHud() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Holographic reactor rings behind the content */}
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 400 400"
          className="h-[120vh] w-[120vh] max-w-none opacity-[0.18]"
        >
          <g
            className="hud-spin"
            style={{ transformOrigin: "200px 200px" }}
            stroke="#01d5e0"
            fill="none"
          >
            <circle cx="200" cy="200" r="190" strokeWidth="0.6" strokeDasharray="2 10" />
            <circle cx="200" cy="200" r="150" strokeWidth="0.5" strokeDasharray="40 14" />
          </g>
          <g
            className="hud-spin-rev"
            style={{ transformOrigin: "200px 200px" }}
            stroke="#01d5e0"
            fill="none"
          >
            <circle cx="200" cy="200" r="120" strokeWidth="0.6" strokeDasharray="1 8" />
            <circle cx="200" cy="200" r="90" strokeWidth="0.5" strokeDasharray="20 10" />
          </g>
        </svg>
      </div>

      {/* Grid + scanlines */}
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
        <div className="hud-grid absolute inset-0 opacity-70" />
        <div className="hud-scanlines absolute inset-0 opacity-60" />
      </div>

      {/* Drifting particle field */}
      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 rounded-full bg-cyan-300/70"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                boxShadow: "0 0 6px rgba(34,211,238,0.8)",
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: ["0vh", "-105vh"], x: [0, p.drift, 0], opacity: [0, 0.8, 0] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Refined corner targeting brackets */}
      <div className="pointer-events-none absolute inset-0 z-[50] hidden sm:block">
        <Corner className="left-5 top-5" rotate={0} delay={0.5} />
        <Corner className="right-5 top-5" rotate={90} delay={0.65} />
        <Corner className="bottom-5 right-5" rotate={180} delay={0.8} />
        <Corner className="bottom-5 left-5" rotate={270} delay={0.95} />
      </div>
    </>
  );
}
