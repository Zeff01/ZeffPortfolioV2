"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface ReadMoreProps {
  title?: string;
  text: string;
}

/**
 * A click-triggered "Read more" that opens an animated glass details modal
 * (portaled to body so it escapes card transforms/overflow). Closes on
 * backdrop click or Escape.
 */
const ReadMore: React.FC<ReadMoreProps> = ({ title, text }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-3 inline-flex items-center gap-1 self-start text-xs font-semibold uppercase tracking-wider text-cyan-400 transition-colors hover:text-cyan-300 sm:mb-4"
      >
        Read more <span aria-hidden>→</span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              >
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.9, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  className="relative z-10 w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-zinc-900/95 p-6 shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur sm:p-8"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 text-gray-400 transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
                  >
                    ✕
                  </button>
                  {title && (
                    <h3 className="mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text pr-8 font-tech text-2xl font-bold text-transparent">
                      {title}
                    </h3>
                  )}
                  <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
                    {text}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default ReadMore;
