"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HiXMark } from "react-icons/hi2";
import JarvisComms from "./JarvisComms";
import JarvisHoloCard from "./JarvisHoloCard";
import { JarvisRoot, useJarvis } from "./JarvisProvider";

/** Closes when the visitor presses Escape and Jarvis is quiet (Escape first interrupts him). */
const CLOSE_KEY = "Escape";

/**
 * J.A.R.V.I.S. on every page but home: a floating arc-reactor button that
 * opens a compact comms console. The conversation carries over from the hero
 * (it lives in JarvisProvider), and project cards / the tech arsenal project
 * over whatever page the visitor is on.
 */
export default function JarvisDock() {
  const pathname = usePathname();
  const { orbState, speaking, touring, card } = useJarvis();
  const [open, setOpen] = useState(false);
  const active = orbState !== "idle" || speaking;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === CLOSE_KEY && !active) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, active]);

  // The home page has the full console; the tour has its own caption bar.
  if (pathname === "/" || touring) return null;

  return (
    <JarvisRoot>
      {card && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 top-16 z-[55]">
          <JarvisHoloCard />
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="jarvis-dock-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-[60] h-[min(540px,calc(100dvh-140px))] w-[min(420px,calc(100vw-32px))] font-tech md:right-6"
            role="dialog"
            aria-label="Talk to J.A.R.V.I.S."
          >
            <JarvisComms variant="dock" className="h-full shadow-[0_0_40px_rgba(0,0,0,0.6)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close J.A.R.V.I.S." : "Ask J.A.R.V.I.S."}
        title={open ? "Close" : "Ask J.A.R.V.I.S."}
        className="group fixed bottom-5 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full md:right-6 md:h-16 md:w-16"
      >
        {/* Arc-reactor orb: rings pulse while he's thinking or talking. */}
        <span
          className={`absolute inset-0 rounded-full border border-[color:var(--jv-accent)] bg-black/70 shadow-[0_0_18px_var(--jv-accent)] backdrop-blur transition-transform group-hover:scale-105 ${
            active ? "jv-dock-pulse" : ""
          }`}
        />
        <span className="absolute inset-[22%] rounded-full border border-[color:var(--jv-line)]" />
        <span
          className={`absolute inset-[36%] rounded-full bg-[color:var(--jv-accent)] shadow-[0_0_14px_var(--jv-accent)] ${
            active ? "jv-blink" : ""
          }`}
        />
        {open ? (
          <HiXMark className="relative text-lg text-white" />
        ) : (
          <span className="jv-accent pointer-events-none absolute -top-7 right-0 hidden whitespace-nowrap text-[10px] tracking-[0.25em] opacity-0 transition-opacity group-hover:opacity-100 md:block">
            ASK J.A.R.V.I.S.
          </span>
        )}
      </button>
    </JarvisRoot>
  );
}
