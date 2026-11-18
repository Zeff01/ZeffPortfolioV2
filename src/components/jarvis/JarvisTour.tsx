"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { JarvisRoot, useJarvis } from "./JarvisProvider";
import { TOUR_STEPS } from "./tourSteps";

const TOUR = {
  /** How long to wait for a section to render after navigating. */
  targetTimeoutMs: 5000,
  pollMs: 80,
  /** Let the smooth scroll settle before talking about what's on screen. */
  scrollSettleMs: 650,
  pauseBetweenMs: 450,
  /** Reading pace when the voice is muted. */
  msPerWord: 330,
  minLineMs: 1800,
  spotlightPadPx: 10,
  edgeMarginPx: 8,
  closeAfterMs: 9000,
} as const;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const selectorFor = (target: string) => `[data-jarvis-tour="${target}"]`;

/** Resolve once the element exists (pages and lazy sections mount asynchronously). */
const waitForElement = async (target: string, isCancelled: () => boolean): Promise<HTMLElement | null> => {
  const deadline = Date.now() + TOUR.targetTimeoutMs;
  while (Date.now() < deadline && !isCancelled()) {
    const el = document.querySelector<HTMLElement>(selectorFor(target));
    if (el && el.getBoundingClientRect().height > 0) return el;
    await wait(TOUR.pollMs);
  }
  return null;
};

/** The element's box, padded and clamped to the viewport so a tall section still frames nicely. */
const frame = (el: HTMLElement): Rect => {
  const r = el.getBoundingClientRect();
  const pad = TOUR.spotlightPadPx;
  const m = TOUR.edgeMarginPx;
  const top = Math.max(r.top - pad, m);
  const left = Math.max(r.left - pad, m);
  const bottom = Math.min(r.bottom + pad, window.innerHeight - m);
  const right = Math.min(r.right + pad, window.innerWidth - m);
  return { top, left, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) };
};

const sameRect = (a: Rect | null, b: Rect) =>
  !!a && Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;

/**
 * "Give me the tour": Jarvis walks the visitor through the site — navigating,
 * scrolling each section into view, spotlighting it and narrating. Lives at
 * the site level so it keeps running across page changes.
 */
export default function JarvisTour() {
  const router = useRouter();
  const { touring, endTour, say, stop, prefetch, voice } = useJarvis();
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [finished, setFinished] = useState(false);
  const target = useRef<HTMLElement | null>(null);
  const skipLine = useRef<(() => void) | null>(null);
  const voiceRef = useRef(voice);

  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  /** Speak a line; resolves when it's done, skipped, or (muted) after a reading pause. */
  const narrate = useCallback(
    (line: string) =>
      new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          skipLine.current = null;
          resolve();
        };
        skipLine.current = done;
        const readMs = Math.max(line.split(/\s+/).length * TOUR.msPerWord, TOUR.minLineMs);
        if (!voiceRef.current) {
          setTimeout(done, readMs);
          return;
        }
        void say(line, { onDone: done });
      }),
    [say]
  );

  // Keep the spotlight glued to its section while the page scrolls or reflows.
  useEffect(() => {
    if (!touring) return;
    let raf = 0;
    const tick = () => {
      const el = target.current;
      if (el?.isConnected) {
        const next = frame(el);
        setRect((prev) => (sameRect(prev, next) ? prev : next));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [touring]);

  // The tour itself.
  useEffect(() => {
    if (!touring) return;
    let cancelled = false;
    const isCancelled = () => cancelled;
    TOUR_STEPS.forEach((s) => void prefetch(s.line));

    void (async () => {
      setFinished(false);
      for (let i = 0; i < TOUR_STEPS.length && !cancelled; i++) {
        const step = TOUR_STEPS[i];
        setStepIndex(i);
        if (window.location.pathname !== step.path) {
          target.current = null;
          setRect(null);
          router.push(step.path);
        }
        const el = await waitForElement(step.target, isCancelled);
        if (cancelled) return;
        target.current = el;
        if (el) {
          const tall = el.getBoundingClientRect().height > window.innerHeight * 0.75;
          el.scrollIntoView({ behavior: "smooth", block: tall ? "start" : "center" });
          await wait(TOUR.scrollSettleMs);
        } else {
          setRect(null);
        }
        if (cancelled) return;
        await narrate(step.line);
        await wait(TOUR.pauseBetweenMs);
      }
      if (!cancelled) setFinished(true);
    })();

    return () => {
      cancelled = true;
      skipLine.current?.();
      target.current = null;
      setRect(null);
    };
  }, [touring, narrate, prefetch, router]);

  const close = useCallback(() => {
    stop();
    endTour();
  }, [endTour, stop]);

  const skip = useCallback(() => {
    stop();
    skipLine.current?.();
  }, [stop]);

  // Linger on the last stop briefly, then step aside.
  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(endTour, TOUR.closeAfterMs);
    return () => clearTimeout(t);
  }, [finished, endTour]);

  useEffect(() => {
    if (!touring) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [touring, close, skip]);

  const step = TOUR_STEPS[stepIndex];

  return (
    <AnimatePresence>
      {touring && (
        <JarvisRoot key="jarvis-tour">
          {rect && (
            <div
              className="jv-spotlight"
              style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
              aria-hidden
            />
          )}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-4 left-1/2 z-[70] w-[min(640px,calc(100vw-32px))] -translate-x-1/2"
            role="dialog"
            aria-label="Guided tour"
          >
            <section className="jv-panel font-tech">
              <header className="flex items-center justify-between gap-2 border-b border-[color:var(--jv-line)] px-4 py-2 text-[10px] tracking-[0.25em] md:text-xs">
                <span className="jv-accent">J.A.R.V.I.S. // GUIDED TOUR</span>
                <span className="jv-dim">
                  {finished ? "COMPLETE" : `${stepIndex + 1} / ${TOUR_STEPS.length}`}
                </span>
              </header>
              <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-4">
                <p className="flex-1 text-sm leading-relaxed md:text-base" aria-live="polite">
                  {step.line}
                </p>
                <div className="flex shrink-0 gap-2">
                  {finished ? (
                    <button
                      type="button"
                      onClick={() => {
                        endTour();
                        router.push("/");
                      }}
                      className="jv-chip jv-accent px-3 py-1.5 text-[10px] tracking-widest md:text-xs"
                    >
                      BACK TO J.A.R.V.I.S.
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={skip}
                      className="jv-chip px-3 py-1.5 text-[10px] tracking-widest md:text-xs"
                      title="Next stop (→)"
                    >
                      NEXT ›
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={close}
                    className="jv-chip px-3 py-1.5 text-[10px] tracking-widest md:text-xs"
                    title="End tour (Esc)"
                  >
                    {finished ? "CLOSE" : "END TOUR"}
                  </button>
                </div>
              </div>
              <div className="jv-bar-track h-0.5 w-full">
                <div
                  className="jv-bar-fill h-full"
                  style={{ width: `${((finished ? TOUR_STEPS.length : stepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>
            </section>
          </motion.div>
        </JarvisRoot>
      )}
    </AnimatePresence>
  );
}
