"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Strip bullets/URLs so the voice reads naturally. */
const speakable = (text: string) =>
  text
    .replace(/https?:\/\/\S+/g, "the link")
    .replace(/J\.A\.R\.V\.I\.S\./g, "Jarvis")
    .replace(/[•|]/g, ",")
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

  const prefetch = useCallback(
    (text: string) => {
      if (enabledRef.current) void fetchNeural(text);
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
      lineId.current++;
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
    prefetch,
    speaking: speaking && enabled,
    audioBlocked: audioBlocked && enabled,
    level,
  };
}
