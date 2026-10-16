"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiMicrophone, HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import Panel from "./Panel";
import { useJarvis } from "./JarvisProvider";
import { JARVIS_THEMES, STORAGE_KEYS } from "./theme";
import { usePref } from "./usePref";
import { useJarvisListen } from "./useJarvisListen";
import { askJarvis, QUICK_PROMPTS, type JarvisAction, type JarvisReply } from "./jarvisBrain";

interface ChatMessage {
  id: number;
  from: "user" | "jarvis";
  text: string;
  time: string;
}

interface JarvisCommsProps {
  className?: string;
}

const TIMING = {
  /** Let the hero's intro animation land before Jarvis speaks up. */
  greetingDelayMs: 4300,
  thinkMs: 650,
  streamTickMs: 16,
  charsPerTick: 3,
  actionDelayMs: 900,
  /** Never hold the text back longer than this waiting for the voice to start. */
  voiceStartCapMs: 2500,
  /** Captions finish slightly ahead of the voice so the bubble never lags it. */
  captionPace: 0.85,
  /** Preload the quick-prompt voices after the greeting has had the network to itself. */
  warmupDelayMs: 9000,
} as const;

/** What speech recognition tends to hear instead of "Zeff". */
const MISHEARD_NAME = /\b(jeff|zef|zeph|jeph)('s)?\b/gi;
const fixHeard = (text: string) => text.replace(MISHEARD_NAME, (_m, _n: string, s?: string) => `Zeff${s ?? ""}`);

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

const greeting = () => {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}. Welcome to Zeff's portfolio. I am J.A.R.V.I.S. — ask me anything about his skills, experience or projects.`;
};

/**
 * The hero's comms panel — openclaw's streaming chat wired to the local
 * portfolio brain. Jarvis greets the visitor on his own (voice on by default),
 * streams replies, speaks them, and can drive the site.
 */
export default function JarvisComms({ className }: JarvisCommsProps) {
  const router = useRouter();
  const { setChatState, orbState, say, prefetch, audioBlocked, voice, setVoice, theme, setTheme, applyAction } =
    useJarvis();
  const [micPref, setMicPref] = usePref(STORAGE_KEYS.mic, "1");
  const micOn = micPref === "1";
  const [heard, setHeard] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (streamRef.current) clearInterval(streamRef.current);
    },
    []
  );

  // Keep the newest message in view without scrolling the page.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const runAction = useCallback(
    (action: JarvisAction) => {
      if (action.type === "clear") setMessages([]);
      else if (action.type === "navigate")
        timers.current.push(setTimeout(() => router.push(action.href), TIMING.actionDelayMs));
      else if (action.type === "open") window.open(action.href, "_blank", "noopener,noreferrer");
      else applyAction(action);
    },
    [applyAction, router]
  );

  /** Type the reply into its bubble — paced to the voice when we know how long it is. */
  const stream = useCallback(
    (id: number, reply: JarvisReply, voiceSec: number | null) => {
      const text = reply.text;
      const ticks = voiceSec ? (voiceSec * 1000 * TIMING.captionPace) / TIMING.streamTickMs : 0;
      const perTick = ticks > 0 ? Math.max(text.length / ticks, 0.5) : TIMING.charsPerTick;
      let shown = 0;
      setChatState("responding");
      if (streamRef.current) clearInterval(streamRef.current);
      streamRef.current = setInterval(() => {
        shown = Math.min(text.length, shown + perTick);
        const slice = text.slice(0, Math.floor(shown));
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: slice } : msg)));
        if (shown >= text.length) {
          if (streamRef.current) clearInterval(streamRef.current);
          streamRef.current = null;
          setStreamingId(null);
          setBusy(false);
          setChatState("idle");
          if (reply.action) runAction(reply.action);
        }
      }, TIMING.streamTickMs);
    },
    [runAction, setChatState]
  );

  /** Open a bubble, start the voice, and begin typing the moment the voice starts. */
  const deliver = useCallback(
    (reply: JarvisReply) => {
      if (reply.action?.type === "clear") {
        runAction(reply.action);
        setBusy(false);
        setChatState("idle");
        return;
      }
      const id = nextId.current++;
      setMessages((m) => [...m, { id, from: "jarvis", text: "", time: now() }]);
      setStreamingId(id);

      let started = false;
      const begin = (voiceSec: number | null) => {
        if (started) return;
        started = true;
        stream(id, reply, voiceSec);
      };
      timers.current.push(setTimeout(() => begin(null), TIMING.voiceStartCapMs));
      void say(reply.text, { onStart: begin });
    },
    [runAction, say, setChatState, stream]
  );

  // Jarvis talks first — once per visit to the page.
  const greeted = useRef(false);
  const greetingLine = useRef(greeting());
  // Fetch the greeting's audio straight away so it's ready when Jarvis speaks,
  // then the quick-prompt answers (the likeliest questions) once he's done.
  useEffect(() => {
    prefetch(greetingLine.current);
    const t = setTimeout(
      () => QUICK_PROMPTS.forEach((p) => prefetch(askJarvis(p).text)),
      TIMING.warmupDelayMs
    );
    return () => clearTimeout(t);
  }, [prefetch]);
  useEffect(() => {
    if (greeted.current) return;
    const t = setTimeout(() => {
      greeted.current = true;
      setBusy(true);
      deliver({ text: greetingLine.current });
    }, TIMING.greetingDelayMs);
    return () => clearTimeout(t);
  }, [deliver]);

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setInput("");
      setBusy(true);
      setMessages((m) => [...m, { id: nextId.current++, from: "user", text, time: now() }]);
      setChatState("thinking");
      const reply = askJarvis(text);
      prefetch(reply.text); // the voice loads while Jarvis "thinks"
      timers.current.push(setTimeout(() => deliver(reply), TIMING.thinkMs));
    },
    [busy, deliver, prefetch, setChatState]
  );

  // Hands-free: while Jarvis is idle the mic stays open, so visitors can just ask.
  const { status: micStatus } = useJarvisListen({
    enabled: micOn,
    paused: busy || orbState !== "idle",
    onFinal: (text) => send(fixHeard(text)),
    onInterim: (text) => setHeard(text ? fixHeard(text) : ""),
  });
  const listening = micStatus === "listening";
  const micAvailable = micStatus !== "unsupported";

  const headerActions = (
    <>
      <span className="hidden items-center gap-1.5 sm:flex" role="radiogroup" aria-label="Armor finish">
        {JARVIS_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={t.id === theme.id}
            aria-label={t.name}
            title={t.name}
            onClick={() => setTheme(t.id)}
            className={`h-2.5 w-2.5 md:h-3 md:w-3 rotate-45 border transition-transform hover:scale-125 ${
              t.id === theme.id ? "scale-125 border-white" : "border-transparent"
            }`}
            style={{ background: `hsl(${t.hue} 95% 55%)` }}
          />
        ))}
      </span>
      {micAvailable && (
        <button
          type="button"
          onClick={() => setMicPref(micOn ? "0" : "1")}
          aria-pressed={micOn}
          aria-label={micOn ? "Stop listening" : "Talk to J.A.R.V.I.S."}
          title={micStatus === "denied" ? "Microphone blocked by the browser" : micOn ? "Stop listening" : "Listen"}
          className={`text-sm transition-opacity hover:opacity-70 md:text-lg ${
            listening ? "jv-accent jv-blink" : micOn && micStatus !== "denied" ? "jv-accent" : "jv-dim line-through"
          }`}
        >
          <HiMicrophone />
        </button>
      )}
      <button
        type="button"
        onClick={() => setVoice(!voice)}
        aria-pressed={voice}
        aria-label={voice ? "Mute J.A.R.V.I.S." : "Unmute J.A.R.V.I.S."}
        title={voice ? "Mute" : "Unmute"}
        className="jv-accent text-sm transition-opacity hover:opacity-70 md:text-lg"
      >
        {voice ? <HiSpeakerWave /> : <HiSpeakerXMark className="jv-dim" />}
      </button>
    </>
  );

  return (
    <Panel
      title="COMMS // J.A.R.V.I.S."
      tag={busy ? "LIVE" : listening ? "LISTENING" : "READY"}
      actions={headerActions}
      className={className}
      bodyClassName="flex min-h-0 flex-col gap-2"
    >
      <div
        ref={scrollRef}
        className="jv-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 md:space-y-3"
        role="log"
        aria-live="polite"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[92%] px-2.5 py-1.5 md:px-3.5 md:py-2.5 ${m.from === "user" ? "jv-bubble-user text-right" : "jv-bubble-ai"}`}>
              <div className="text-[9px] tracking-widest md:text-xs">
                <span className={m.from === "user" ? "text-textColor" : "jv-accent"}>
                  {m.from === "user" ? "VISITOR" : "J.A.R.V.I.S."}
                </span>
                <span className="jv-dim"> · {m.time}</span>
              </div>
              <p className="whitespace-pre-line break-words text-xs leading-relaxed md:text-[15px] xl:text-base">
                {m.text}
                {m.id === streamingId && <span className="jv-blink jv-accent">▍</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      {(heard || audioBlocked || micStatus === "denied") && (
        <p className="jv-dim truncate text-[10px] tracking-wider md:text-xs" aria-live="polite">
          {heard ? (
            <span className="jv-accent">“{heard}…”</span>
          ) : audioBlocked ? (
            <span className="jv-blink">Click or tap anywhere to let me speak — browsers mute sites until then.</span>
          ) : (
            "Microphone unavailable — allow mic access in the address bar to talk to me."
          )}
        </p>
      )}

      <div className="hidden flex-wrap gap-1.5 md:flex">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={busy}
            onClick={() => send(p)}
            className="jv-chip px-2 py-0.5 text-[10px] tracking-wider disabled:opacity-40 md:px-2.5 md:py-1 md:text-xs"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <label htmlFor="jarvis-input" className="sr-only">
          Ask J.A.R.V.I.S.
        </label>
        <input
          id="jarvis-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening — just speak, or type here…" : "Ask J.A.R.V.I.S. anything…"}
          autoComplete="off"
          className="jv-input min-w-0 flex-1 px-2.5 py-1.5 text-xs placeholder:text-[color:var(--jv-dim)] md:px-3.5 md:py-2.5 md:text-base"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="jv-chip px-3 text-[10px] tracking-widest disabled:opacity-40 md:px-4 md:text-xs"
        >
          SEND
        </button>
      </form>
    </Panel>
  );
}
