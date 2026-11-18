"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* Minimal Web Speech API typings — not part of TypeScript's DOM lib. */
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: RecognitionAlternative;
}
interface RecognitionResultList {
  readonly length: number;
  [index: number]: RecognitionResult;
}
interface RecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: RecognitionResultList;
}
interface RecognitionErrorEvent extends Event {
  readonly error: string;
}
interface Recognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

const LISTEN = {
  lang: "en-US",
  /** Let Jarvis's own voice die down before the mic reopens (avoids hearing himself). */
  resumeDelayMs: 450,
  /** Chrome ends sessions on silence; reopen quickly. */
  restartDelayMs: 250,
  /** Back off after network errors (offline, or browsers without the speech service). */
  networkRetryMs: 3000,
  maxNetworkErrors: 3,
  minChars: 2,
} as const;

/** Saying one of these while Jarvis talks just silences him (it isn't sent as a question). */
const INTERRUPT_PHRASE = /^(ok(ay)? )?(stop|wait|hold on|hang on|pause|enough|quiet|shush|jarvis stop|stop jarvis)[.!]?$/i;
const INTERRUPT_MAX_WORDS = 4;

/** Words of real speech needed before we treat it as the visitor talking over Jarvis. */
const BARGE_MIN_WORDS = 2;

const isInterrupt = (text: string) => {
  const t = text.trim();
  return t.split(/\s+/).length <= INTERRUPT_MAX_WORDS && INTERRUPT_PHRASE.test(t);
};

/** Errors meaning the mic is off-limits — stop asking. */
const FATAL_ERRORS = new Set(["not-allowed", "service-not-allowed", "audio-capture"]);

/** "Hey Jarvis, show me projects" → "show me projects". */
const stripWakeWord = (text: string) =>
  text.replace(/^\s*(hey|ok|okay|hi|hello)?[\s,]*jarvis[\s,.!?]*/i, "").trim();

const getCtor = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const noopSubscribe = () => () => {};

export type ListenStatus = "unsupported" | "off" | "denied" | "paused" | "listening";

interface UseJarvisListenOptions {
  /** Mic switched on by the visitor (default on). */
  enabled: boolean;
  /** Keep the mic closed entirely. */
  paused: boolean;
  /** A finished spoken question. */
  onFinal: (text: string) => void;
  /** Live words while the visitor is still talking ("" when cleared). */
  onInterim?: (text: string) => void;
  /**
   * Jarvis is speaking. Anything the visitor says cuts him off (barge-in) and
   * becomes their next question — except what `isEcho` recognises as Jarvis's
   * own voice coming back through the mic. "Stop" / "wait" just silence him.
   */
  interruptOnly?: boolean;
  onInterrupt?: () => void;
  isEcho?: (heard: string) => boolean;
}

/**
 * Hands-free questions: keeps the browser's speech recognition open while
 * Jarvis is idle, so visitors can just talk. The browser asks for mic
 * permission once; after that it reconnects on its own.
 */
export function useJarvisListen({
  enabled,
  paused,
  onFinal,
  onInterim,
  interruptOnly = false,
  onInterrupt,
  isEcho,
}: UseJarvisListenOptions) {
  // Server render says "unsupported"; the client re-checks after hydration.
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getCtor() !== null,
    () => false
  );
  const [active, setActive] = useState(false);
  const [denied, setDenied] = useState(false);
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  const onInterruptRef = useRef(onInterrupt);
  const isEchoRef = useRef(isEcho);
  const interruptRef = useRef(interruptOnly);
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => {
    onFinalRef.current = onFinal;
    onInterimRef.current = onInterim;
    onInterruptRef.current = onInterrupt;
    isEchoRef.current = isEcho;
  }, [onFinal, onInterim, onInterrupt, isEcho]);

  // Leaving interrupt mode: restart recognition so the tail of Jarvis's own
  // sentence (still buffered in the recogniser) is never taken as a question.
  useEffect(() => {
    const wasInterrupt = interruptRef.current;
    interruptRef.current = interruptOnly;
    if (wasInterrupt && !interruptOnly) {
      onInterimRef.current?.("");
      recRef.current?.abort();
    }
  }, [interruptOnly]);

  const shouldRun = supported && enabled && !paused && !denied;

  useEffect(() => {
    const Ctor = getCtor();
    if (!shouldRun || !Ctor) return;

    let stopped = false;
    let networkErrors = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = LISTEN.lang;
    rec.continuous = true;
    rec.interimResults = true;

    const startSoon = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (stopped) return;
        try {
          rec.start();
        } catch {
          // Already started — nothing to do.
        }
      }, ms);
    };

    rec.onstart = () => setActive(true);
    rec.onresult = (e) => {
      networkErrors = 0;
      if (interruptRef.current) {
        let barge = false;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const heard = (e.results[i][0]?.transcript ?? "").trim();
          if (isInterrupt(heard)) {
            onInterruptRef.current?.();
            rec.abort(); // "stop" means stop — don't send it as a question
            return;
          }
          const words = heard.split(/\s+/).filter(Boolean).length;
          if (words >= BARGE_MIN_WORDS && !isEchoRef.current?.(heard)) barge = true;
        }
        if (!barge) return; // just Jarvis's own voice
        // The visitor is talking over him: hand them the floor and keep this
        // utterance — it carries on below as their question.
        interruptRef.current = false;
        onInterruptRef.current?.();
      }
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          const question = stripWakeWord(text);
          onInterimRef.current?.("");
          if (question.length >= LISTEN.minChars) onFinalRef.current(question);
        } else {
          interim += text;
        }
      }
      if (interim) onInterimRef.current?.(stripWakeWord(interim) || interim);
    };
    rec.onerror = (e) => {
      if (FATAL_ERRORS.has(e.error)) {
        stopped = true;
        setDenied(true);
      } else if (e.error === "network") {
        networkErrors++;
        if (networkErrors >= LISTEN.maxNetworkErrors) stopped = true;
      }
    };
    rec.onend = () => {
      setActive(false);
      if (!stopped) startSoon(networkErrors ? LISTEN.networkRetryMs : LISTEN.restartDelayMs);
    };

    startSoon(LISTEN.resumeDelayMs);
    return () => {
      stopped = true;
      clearTimeout(timer);
      rec.onend = null;
      rec.abort();
      if (recRef.current === rec) recRef.current = null;
      setActive(false);
      onInterimRef.current?.("");
    };
  }, [shouldRun]);

  const status: ListenStatus = !supported
    ? "unsupported"
    : denied
      ? "denied"
      : !enabled
        ? "off"
        : paused || !active
          ? "paused"
          : "listening";

  return { status };
}
