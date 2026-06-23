"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export interface CaseStudy {
  problem: string;
  approach: string;
  result: string;
  metrics?: { value: string; label: string }[];
}

interface ReadMoreProps {
  title?: string;
  text: string;
  role?: string;
  caseStudy?: CaseStudy;
}

const Section = ({ label, text }: { label: string; text: string }) => (
  <div>
    <h4 className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
      {label}
    </h4>
    <p className="text-sm leading-relaxed text-gray-300">{text}</p>
  </div>
);

/**
 * Click-triggered "Read more" → animated glass modal (portaled to body).
 * Renders a structured case study (Challenge / Approach / Outcome + metrics)
 * when `caseStudy` is provided, otherwise the plain `text`.
 */
const ReadMore: React.FC<ReadMoreProps> = ({ title, text, role, caseStudy }) => {
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

  const label = caseStudy ? "View case study" : "Read more";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-3 inline-flex items-center gap-1 self-start text-xs font-semibold uppercase tracking-wider text-cyan-400 transition-colors hover:text-cyan-300 sm:mb-4"
      >
        {label} <span aria-hidden>→</span>
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
                  className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cyan-400/30 bg-zinc-900/95 p-6 shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur sm:p-8"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 text-gray-400 transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
                  >
                    ✕
                  </button>

                  <div className="mb-5 pr-8">
                    {title && (
                      <h3 className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text font-tech text-2xl font-bold text-transparent">
                        {title}
                      </h3>
                    )}
                    {role && (
                      <span className="mt-2 inline-block rounded-full bg-zinc-700 px-3 py-0.5 text-xs font-medium text-gray-200">
                        {role}
                      </span>
                    )}
                  </div>

                  {caseStudy ? (
                    <div className="space-y-5">
                      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {caseStudy.metrics.map((m) => (
                            <div
                              key={m.label}
                              className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center"
                            >
                              <div className="text-base font-bold text-textColor sm:text-lg">
                                {m.value}
                              </div>
                              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                                {m.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Section label="The Challenge" text={caseStudy.problem} />
                      <Section label="My Approach" text={caseStudy.approach} />
                      <Section label="The Outcome" text={caseStudy.result} />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
                      {text}
                    </p>
                  )}
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
