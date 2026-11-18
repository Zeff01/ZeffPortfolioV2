"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Strip bullets/URLs so the voice reads naturally. */
const speakable = (text: string) =>
  text
    .replace(/https?:\/\/\S+/g, "the link")
    .replace(/J\.A\.R\.V\.I\.S\./g, "Jarvis")
    // A bulleted line becomes its own clause: "Most recent:\n• A\n• B" → "Most recent: A. B."
    .replace(/:\s*\n\s*[•|]\s*/g, ": ")
    .replace(/[.,;]?\s*\n\s*[•|]\s*/g, ". ")
    .replace(/\s*[•|]\s*/g, ", ")
    .replace(/([^.!?:])\s*\n+\s*/g, "$1. ")
    .replace(/\s+/g, " ")
    .trim();

const VOICE_ENDPOINT = "/api/jarvis/voice";

/** Browser speechSynthesis fallback — used when no TTS key is configured. */
const FALLBACK_VOICE = {
  rate: 1.02,
  pitch: 0.9,
  /** Chrome loads voices async; don't wait forever for them. */
  loadTimeoutMs: 1200,
} as const;

/**
 * The "AI system" colouring on top of the neural voice: trimmed lows, a
 * presence lift and a faint short-delay shimmer. Subtle on purpose — it should
 * read as a voice coming through a suit, not a robot effect.
 */
const FX = {
  highpassHz: 120,
  lowpassHz: 9500,
  presenceHz: 3200,
  presenceGainDb: 4,
  presenceQ: 0.9,
  shimmerDelaySec: 0.018,
  shimmerFeedback: 0.22,
  shimmerMix: 0.14,
  analyserFftSize: 1024,
  /** RMS → 0..1 visual level. */
  levelGain: 3.2,
  levelSmoothing: 0.35,
} as const;

/** Status codes meaning "no neural voice on this deployment" — stop asking. */
const UNAVAILABLE_STATUSES = new Set([404, 503]);

const GESTURE_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

const pickFallbackVoice = (): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-GB" && /daniel|arthur|george|male/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en"))
  );
};

const voicesReady = (): Promise<void> =>
  new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length) return resolve();
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    setTimeout(done, FALLBACK_VOICE.loadTimeoutMs);
  });

/** How long to wait for a suspended AudioContext to start before calling audio blocked. */
const UNLOCK_WAIT_MS = 250;
/** Client-side audio memo (per page view) — bounded so a long chat can't grow it forever. */
const MAX_PREFETCHED = 40;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface QueuedLine {
  text: string;
  audio: Promise<Blob | null>;
  hooks: SayHooks;
  /** A silent marker: fires `hooks.onDone` once everything before it has been said. */
  marker?: boolean;
}

export interface SayHooks {
  /** Fired when the voice actually starts (or right away when it can't play); duration in seconds when known. */
  onStart?: (durationSec: number | null) => void;
  onDone?: () => void;
}

interface AudioChain {
  ctx: AudioContext;
  input: AudioNode;
  analyser: AnalyserNode;
}

const buildChain = (): AudioChain | null => {
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();

  const highpass = new BiquadFilterNode(ctx, { type: "highpass", frequency: FX.highpassHz });
  const lowpass = new BiquadFilterNode(ctx, { type: "lowpass", frequency: FX.lowpassHz });
  const presence = new BiquadFilterNode(ctx, {
    type: "peaking",
    frequency: FX.presenceHz,
    gain: FX.presenceGainDb,
    Q: FX.presenceQ,
  });
  const delay = new DelayNode(ctx, { delayTime: FX.shimmerDelaySec });
  const feedback = new GainNode(ctx, { gain: FX.shimmerFeedback });
  const wet = new GainNode(ctx, { gain: FX.shimmerMix });
  const analyser = new AnalyserNode(ctx, { fftSize: FX.analyserFftSize });

  highpass.connect(lowpass).connect(presence);
  presence.connect(analyser);
  presence.connect(delay).connect(feedback).connect(delay);
  delay.connect(wet).connect(analyser);
  analyser.connect(ctx.destination);

  return { ctx, input: highpass, analyser };
};

/**
 * J.A.R.V.I.S.'s voice.
 *
 * Prefers the neural voice from `/api/jarvis/voice` (ElevenLabs / OpenAI,
 * key kept server-side) played through a light "suit comms" filter, and falls
 * back to the browser's British speech voice when that isn't configured.
 *
 * Browsers block audio until the visitor has interacted with the page (no site
 * can bypass that). When it happens the line is kept and spoken on the
 * visitor's first tap/keypress, and `audioBlocked` lets the UI say so.
 *
 * `level()` returns the live loudness (0..1) of the neural voice, or -1 when
 * there's no audio stream to read — the orb and waveform use it to move with
 * the actual speech.
 */
export function useJarvisVoice(enabled: boolean) {
  const [speaking, setSpeaking] = useState(false);
  /** True while a line is waiting for the visitor's first interaction (browser autoplay rule). */
  const [audioBlocked, setAudioBlocked] = useState(false);
  const enabledRef = useRef(enabled);
  const pending = useRef<string | null>(null);
  const neuralAvailable = useRef(true);
  const chain = useRef<AudioChain | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const prefetched = useRef(new Map<string, Promise<Blob | null>>());
  const levelBuf = useRef<Float32Array<ArrayBuffer> | null>(null);
  const smoothedLevel = useRef(0);
  /** Bumped per line so a slow fetch can't talk over a newer one. */
  const lineId = useRef(0);
  /** Streamed sentences waiting their turn (their audio is already being fetched). */
  const queue = useRef<QueuedLine[]>([]);
  const draining = useRef(false);
  /**
   * Ends the queued line that's playing right now. Pausing audio fires no
   * "ended" event, so without this an interrupted line would hang the queue
   * and Jarvis would go silent for every answer after it.
   */
  const releaseCurrent = useRef<(() => void) | null>(null);

  const ensureChain = useCallback((): AudioChain | null => {
    if (!chain.current) chain.current = buildChain();
    if (chain.current?.ctx.state === "suspended") void chain.current.ctx.resume().catch(() => {});
    return chain.current;
  }, []);

  /** Can we make sound right now? (False until the visitor has interacted, in most browsers.) */
  const unlocked = useCallback(async (c: AudioChain | null): Promise<boolean> => {
    if (!c || c.ctx.state === "running") return true;
    await Promise.race([c.ctx.resume().catch(() => {}), wait(UNLOCK_WAIT_MS)]);
    // Re-read: resume() changes the state asynchronously.
    return (c.ctx.state as AudioContextState) === "running";
  }, []);

  /** Cut any line in progress (state is reset by the caller, or masked by `enabled`). */
  const silence = useCallback(() => {
    audioEl.current?.pause();
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const block = useCallback((text: string) => {
    pending.current = text;
    setAudioBlocked(true);
  }, []);

  /** Fetch (once) the neural audio for a line. Safe to call early to hide network latency. */
  const fetchNeural = useCallback((text: string): Promise<Blob | null> => {
    const line = speakable(text);
    const memo = prefetched.current;
    const hit = memo.get(line);
    if (hit) return hit;
    if (!neuralAvailable.current) return Promise.resolve(null);

    const job = (async () => {
      try {
        const res = await fetch(`${VOICE_ENDPOINT}?text=${encodeURIComponent(line)}`);
        if (res.ok) return await res.blob();
        if (UNAVAILABLE_STATUSES.has(res.status)) neuralAvailable.current = false;
      } catch {
        // Network hiccup — this line goes to the fallback voice.
      }
      memo.delete(line); // let a failed line be retried later
      return null;
    })();
    if (memo.size >= MAX_PREFETCHED) {
      const oldest = memo.keys().next().value;
      if (oldest !== undefined) memo.delete(oldest);
    }
    memo.set(line, job);
    return job;
  }, []);

  /** Warm a line's audio; resolves once it has loaded (or failed), so callers can queue. */
  const prefetch = useCallback(
    async (text: string): Promise<void> => {
      if (enabledRef.current) await fetchNeural(text);
    },
    [fetchNeural]
  );

  const speakFallback = useCallback(
    async (text: string, id: number, hooks: SayHooks, finish: () => void) => {
      if (!("speechSynthesis" in window)) {
        hooks.onStart?.(null);
        return finish();
      }
      await voicesReady();
      if (id !== lineId.current) return;
      const u = new SpeechSynthesisUtterance(speakable(text));
      const v = pickFallbackVoice();
      if (v) u.voice = v;
      u.rate = FALLBACK_VOICE.rate;
      u.pitch = FALLBACK_VOICE.pitch;
      u.onstart = () => {
        setSpeaking(true);
        hooks.onStart?.(null);
      };
      u.onend = finish;
      u.onerror = (e) => {
        if (e.error === "not-allowed") block(text);
        hooks.onStart?.(null);
        finish();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [block]
  );

  /** Resolves "played" | "blocked" | "failed". */
  const playNeural = useCallback(
    async (blob: Blob, hooks: SayHooks, finish: () => void): Promise<"played" | "blocked" | "failed"> => {
      const c = ensureChain();
      if (!(await unlocked(c))) return "blocked";
      if (!audioEl.current) {
        audioEl.current = new Audio();
        if (c) c.ctx.createMediaElementSource(audioEl.current).connect(c.input);
      }
      const el = audioEl.current;
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
      audioUrl.current = URL.createObjectURL(blob);
      el.src = audioUrl.current;
      el.onplaying = () => {
        setSpeaking(true);
        hooks.onStart?.(Number.isFinite(el.duration) ? el.duration : null);
      };
      el.onended = finish;
      el.onerror = finish;
      try {
        await el.play();
        return "played";
      } catch (error: unknown) {
        const name = error instanceof DOMException ? error.name : "";
        return name === "NotAllowedError" ? "blocked" : "failed";
      }
    },
    [ensureChain, unlocked]
  );

  const say = useCallback(
    async (text: string, hooks: SayHooks = {}) => {
      const id = ++lineId.current;
      queue.current = [];
      releaseCurrent.current?.();
      const finish = () => {
        if (id !== lineId.current) return;
        setSpeaking(false);
        hooks.onDone?.();
      };
      if (!enabledRef.current) {
        hooks.onStart?.(null);
        return finish();
      }
      silence();
      setSpeaking(false);

      const blob = await fetchNeural(text);
      if (id !== lineId.current) return;
      if (!enabledRef.current) {
        hooks.onStart?.(null);
        return finish();
      }
      if (blob) {
        const result = await playNeural(blob, hooks, finish);
        if (result === "played") return;
        if (result === "blocked") block(text);
        hooks.onStart?.(null);
        return finish();
      }
      await speakFallback(text, id, hooks, finish);
    },
    [block, fetchNeural, playNeural, speakFallback, silence]
  );

  /** Play one queued sentence to the end; false when playback is blocked or interrupted. */
  const playQueued = useCallback(
    async (line: QueuedLine, id: number): Promise<boolean> => {
      if (line.marker) {
        line.hooks.onDone?.();
        return true;
      }
      const blob = await line.audio;
      if (id !== lineId.current || !enabledRef.current) return false;
      return new Promise<boolean>((resolve) => {
        let settled = false;
        const settle = (ok: boolean) => {
          if (settled) return;
          settled = true;
          if (releaseCurrent.current === release) releaseCurrent.current = null;
          resolve(ok);
        };
        const release = () => settle(false);
        releaseCurrent.current = release;
        const finish = () => {
          const current = id === lineId.current;
          if (current) line.hooks.onDone?.();
          settle(current);
        };
        if (!blob) {
          void speakFallback(line.text, id, line.hooks, finish);
          return;
        }
        void playNeural(blob, line.hooks, finish).then((result) => {
          if (result === "played") return;
          if (result === "blocked") {
            // Keep everything not yet said for the visitor's first tap.
            block([line.text, ...queue.current.map((q) => q.text)].join(" "));
            queue.current = [];
          }
          line.hooks.onStart?.(null);
          settle(false);
        });
      });
    },
    [block, playNeural, speakFallback]
  );

  const drain = useCallback(async () => {
    if (draining.current) return;
    draining.current = true;
    let id = lineId.current;
    // Re-reads the id each time: lines queued after an interruption belong to the new answer.
    while (queue.current.length) {
      id = lineId.current;
      const line = queue.current.shift();
      if (line) await playQueued(line, id);
    }
    draining.current = false;
    if (id === lineId.current) setSpeaking(false);
  }, [playQueued]);

  /**
   * Speak streamed text sentence by sentence: each one's audio starts fetching
   * immediately, and they play back to back. Use `say` for a single line.
   */
  const enqueue = useCallback(
    (text: string, hooks: SayHooks = {}) => {
      if (!text.trim()) return;
      if (!enabledRef.current) {
        hooks.onStart?.(null);
        return;
      }
      if (!draining.current && !queue.current.length) silence();
      queue.current.push({ text, audio: fetchNeural(text), hooks });
      void drain();
    },
    [drain, fetchNeural, silence]
  );

  /** Run `cb` once Jarvis has finished everything queued so far (right away if he's quiet). */
  const whenQuiet = useCallback(
    (cb: () => void) => {
      if (!enabledRef.current || (!draining.current && !queue.current.length)) {
        cb();
        return;
      }
      queue.current.push({ text: "", audio: Promise.resolve(null), hooks: { onDone: cb }, marker: true });
      void drain();
    },
    [drain]
  );

  /** Barge-in: cut Jarvis off mid-sentence and drop whatever he was about to say. */
  const stop = useCallback(() => {
    lineId.current++;
    queue.current = [];
    releaseCurrent.current?.();
    pending.current = null;
    silence();
    setSpeaking(false);
    setAudioBlocked(false);
  }, [silence]);

  const level = useCallback((): number => {
    const c = chain.current;
    const el = audioEl.current;
    if (!c || !el || el.paused) return -1;
    if (!levelBuf.current) levelBuf.current = new Float32Array(c.analyser.fftSize);
    const buf = levelBuf.current;
    c.analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    const target = Math.min(1, rms * FX.levelGain);
    smoothedLevel.current += (target - smoothedLevel.current) * FX.levelSmoothing;
    return smoothedLevel.current;
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) {
      pending.current = null;
      queue.current = [];
      lineId.current++;
      releaseCurrent.current?.();
      silence();
    }
  }, [enabled, silence]);

  // Replay a blocked line as soon as the visitor interacts.
  useEffect(() => {
    const onGesture = () => {
      // Unlock audio inside the gesture itself (Safari is strict about this).
      if (enabledRef.current && neuralAvailable.current) ensureChain();
      setAudioBlocked(false);
      const line = pending.current;
      pending.current = null;
      if (line && enabledRef.current) void say(line);
    };
    GESTURE_EVENTS.forEach((ev) => window.addEventListener(ev, onGesture, { passive: true }));
    return () => GESTURE_EVENTS.forEach((ev) => window.removeEventListener(ev, onGesture));
  }, [ensureChain, say]);

  useEffect(
    () => () => {
      lineId.current++;
      silence();
      void chain.current?.ctx.close();
      chain.current = null;
      audioEl.current = null;
    },
    [silence]
  );

  // Muting cuts the audio without an "ended" event, so mask the flags instead of resetting them.
  return {
    say,
    enqueue,
    whenQuiet,
    stop,
    prefetch,
    speaking: speaking && enabled,
    audioBlocked: audioBlocked && enabled,
    level,
  };
}
