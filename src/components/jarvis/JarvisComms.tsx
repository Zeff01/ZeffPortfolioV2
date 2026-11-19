"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  HiArrowDownTray,
  HiArrowTopRightOnSquare,
  HiCodeBracket,
  HiEnvelope,
  HiMicrophone,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiStop,
} from "react-icons/hi2";
import Panel from "./Panel";
import { useJarvis } from "./JarvisProvider";
import { JARVIS_THEMES, STORAGE_KEYS } from "./theme";
import { usePref } from "./usePref";
import { useJarvisListen } from "./useJarvisListen";
import ProfileForm from "./ProfileForm";
import { askJarvis, QUICK_PROMPTS, speechOf, type JarvisAction, type JarvisReply } from "./jarvisBrain";
import { CONTACT, findMentions, findSkillMentions } from "./portfolio";
import {
  PAGE_PATHS,
  type AgentAction,
  type ChatEvent,
  type ShareLink,
  type ShareTarget,
  type ToolTrace,
  type TraceEntry,
  type TurnMetrics,
} from "./chatProtocol";

interface JarvisCommsProps {
  className?: string;
  /** "hero" = the home page console; "dock" = the floating console on every other page. */
  variant?: "hero" | "dock";
}

/** Suggested questions per page — what a visitor is most likely to want right there. */
const PAGE_PROMPTS: Record<string, readonly string[]> = {
  "/": QUICK_PROMPTS,
  "/about": ["Summarise his experience", "Strongest skills?", "Why hire Zeff?", "Email me his profile"],
  "/projects": ["Most impressive project?", "Show me his AI work", "Tell me about FixFlow", "Email me his profile"],
  "/contact": ["Is he available?", "Email me his profile", "Give me the tour"],
};

const PAGE_NAMES: Record<string, string> = { "/": "home", "/about": "about", "/projects": "projects", "/contact": "contact" };

const DOCK_GREETING = "I'm J.A.R.V.I.S. — ask me about anything on this page.";
const DOCK_GREETING_DELAY_MS = 350;

const CHAT_ENDPOINT = "/api/jarvis/chat";
/** Anonymous question log for answers the local brain gives (the AI route logs its own). */
const LOG_ENDPOINT = "/api/jarvis/log";

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

const SPEECH_CHUNK = {
  /** The first sentence goes to the voice as soon as it's complete — that's the latency win. */
  firstMinChars: 12,
  /** Later ones are batched a little so the voice doesn't stutter between short sentences. */
  minChars: 48,
} as const;

/** Keeping the project card in step with the voice. */
const CARD_SYNC = {
  /** Speaking pace estimate when the audio's length isn't known (~16 chars/s). */
  msPerChar: 62,
} as const;

/** Share of heard words that must appear in Jarvis's own line for it to count as echo. */
const ECHO_OVERLAP = 0.7;
const ECHO_MIN_WORD = 3;

const MAX_HISTORY = 12;
const MAX_TRACE = 20;

const SHARE_LINKS: Record<ShareTarget, ShareLink> = {
  github: { target: "github", label: "GITHUB", href: CONTACT.github },
  linkedin: { target: "linkedin", label: "LINKEDIN", href: CONTACT.linkedin },
  resume: { target: "resume", label: "RÉSUMÉ", href: CONTACT.resume },
  email: { target: "email", label: "EMAIL ZEFF", href: `mailto:${CONTACT.email}` },
};

const SHARE_ICON: Record<ShareTarget, React.ReactNode> = {
  github: <HiArrowTopRightOnSquare />,
  linkedin: <HiArrowTopRightOnSquare />,
  resume: <HiArrowDownTray />,
  email: <HiEnvelope />,
};

/** Map the local brain's "open" links onto the same on-screen buttons. */
const shareFromHref = (href: string): ShareLink | undefined =>
  Object.values(SHARE_LINKS).find((l) => l.href === href);

/** What speech recognition tends to hear instead of "Zeff". */
const MISHEARD_NAME = /\b(jeff|zef|zeph|jeph)('s)?\b/gi;
/** Project names speech recognition reliably gets wrong. */
const MISHEARD_PROJECTS: [RegExp, string][] = [
  [/\b(how|hal|hall|halr|howl)[\s-]?call\b/gi, "Halrcall"],
  [/\brepair[\s-]coin\b/gi, "RepairCoin"],
  [/\bfix[\s-]flow\b/gi, "FixFlow"],
  [/\bask[\s-]?lucy\b/gi, "AskLuci"],
  [/\bcollect[ae]?[\s-]?base\b/gi, "KolektaBase"],
  [/\bagents?[\s-]?ly\b/gi, "Agentsly"],
];
const fixHeard = (text: string) =>
  MISHEARD_PROJECTS.reduce(
    (t, [re, name]) => t.replace(re, name),
    text.replace(MISHEARD_NAME, (_m, _n: string, s?: string) => `Zeff${s ?? ""}`)
  );

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const nowPrecise = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

const greeting = () => {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}. I'm J.A.R.V.I.S. — ask me anything.`;
};

/**
 * Split streamed text into speakable chunks at sentence ends. Returns the
 * complete chunks and the unfinished remainder.
 */
const takeSentences = (buffer: string, isFirst: boolean): [string[], string] => {
  const chunks: string[] = [];
  const boundary = /[.!?…]["')\]]?\s+/g;
  let start = 0;
  for (let m = boundary.exec(buffer); m; m = boundary.exec(buffer)) {
    const end = m.index + m[0].length;
    const chunk = buffer.slice(start, end).trim();
    const min = isFirst && chunks.length === 0 ? SPEECH_CHUNK.firstMinChars : SPEECH_CHUNK.minChars;
    if (chunk.length >= min) {
      chunks.push(chunk);
      start = end;
    }
  }
  return [chunks, buffer.slice(start)];
};

/** Read an NDJSON response body line by line. */
async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl = buffer.indexOf("\n");
    while (nl >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (line) yield JSON.parse(line) as ChatEvent;
      nl = buffer.indexOf("\n");
    }
  }
}

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

/**
 * The hero's comms panel. Questions go to the AI brain (/api/jarvis/chat —
 * Claude, grounded in the portfolio, with tools that drive the site); its reply
 * streams into the bubble and is spoken sentence by sentence as it arrives.
 * Without an API key, the local keyword brain answers instead.
 *
 * Visitors can interrupt at any time — Stop, Esc, typing, or saying "stop".
 * The </> toggle shows what's happening under the hood.
 */
export default function JarvisComms({ className, variant = "hero" }: JarvisCommsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prompts = PAGE_PROMPTS[pathname] ?? QUICK_PROMPTS;
  const isDock = variant === "dock";
  const {
    setChatState,
    orbState,
    say,
    enqueue,
    whenQuiet,
    stop,
    speaking,
    prefetch,
    audioBlocked,
    voice,
    setVoice,
    theme,
    setTheme,
    applyAction,
    showCard,
    showSkills,
    lightSkill,
    hideCard,
    startTour,
    touring,
    session,
    messages,
    setMessages,
    trace,
    setTrace,
    chatIdsRef: nextIdRef,
    chatHistoryRef: historyRef,
    chatFollowUpRef: followUpRef,
  } = useJarvis();
  const [micPref, setMicPref] = usePref(STORAGE_KEYS.mic, "1");
  const micOn = micPref === "1";
  const [heard, setHeard] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** The conversation as the AI sees it. */
  /** What "tell me more" should expand on (local brain). */
  /** null = not checked yet. */
  const aiAvailable = useRef<boolean | null>(null);
  const inflight = useRef<AbortController | null>(null);
  /** What Jarvis is saying right now — used to tell his own voice from the visitor's. */
  const spokenText = useRef("");
  const cardTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      cardTimers.current.forEach(clearTimeout);
      if (streamRef.current) clearInterval(streamRef.current);
      inflight.current?.abort();
    },
    []
  );

  // Keep the newest message in view without scrolling the page.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  /**
   * Keep the hologram in step with the voice: when a chunk of speech starts,
   * schedule each project it names (swap the card) and each technology it
   * names (light it up on the arsenal) at that word's point in the audio.
   */
  const syncCards = useCallback(
    (chunk: string, durationSec: number | null) => {
      const totalMs = durationSec ? durationSec * 1000 : chunk.length * CARD_SYNC.msPerChar;
      const at = (index: number) => (index / Math.max(chunk.length, 1)) * totalMs;
      for (const m of findMentions(chunk)) {
        cardTimers.current.push(setTimeout(() => showCard(m.title), at(m.index)));
      }
      for (const m of findSkillMentions(chunk)) {
        cardTimers.current.push(setTimeout(() => lightSkill(m.title), at(m.index)));
      }
    },
    [lightSkill, showCard]
  );

  const clearCardTimers = useCallback(() => {
    cardTimers.current.forEach(clearTimeout);
    cardTimers.current = [];
  }, []);

  /** Is this (heard through the mic) just Jarvis's own voice? */
  const isEcho = useCallback((heard: string) => {
    const spoken = spokenText.current.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!spoken) return false;
    const words = heard
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= ECHO_MIN_WORD);
    if (!words.length) return true; // too little to tell — don't cut him off
    const hits = words.filter((w) => spoken.includes(w)).length;
    return hits / words.length >= ECHO_OVERLAP;
  }, []);

  const pushTrace = useCallback((entry: Omit<TraceEntry, "id" | "time">) => {
    setTrace((t) => [{ ...entry, id: nextIdRef.current++, time: nowPrecise() }, ...t].slice(0, MAX_TRACE));
  }, [nextIdRef, setTrace]);

  const remember = useCallback((question: string, answer: string) => {
    historyRef.current = [
      ...historyRef.current,
      { role: "user" as const, content: question },
      { role: "assistant" as const, content: answer },
    ].slice(-MAX_HISTORY);
  }, [historyRef]);

  const addLink = useCallback((id: number, link: ShareLink) => {
    setMessages((m) =>
      m.map((msg) =>
        msg.id === id && !msg.links?.some((l) => l.target === link.target)
          ? { ...msg, links: [...(msg.links ?? []), link] }
          : msg
      )
    );
  }, [setMessages]);

  const finishTurn = useCallback(() => {
    setStreamingId(null);
    setBusy(false);
    setChatState("idle");
  }, [setChatState]);

  // ── Local brain (no API key, or the AI is unreachable) ──────────────────────

  const runLocalAction = useCallback(
    (action: JarvisAction, messageId: number) => {
      if (action.type === "clear") setMessages([]);
      else if (action.type === "navigate")
        timers.current.push(setTimeout(() => router.push(action.href), TIMING.actionDelayMs));
      else if (action.type === "open") {
        const link = shareFromHref(action.href);
        if (link) addLink(messageId, link);
      } else if (action.type === "tour") startTour();
      else if (action.type === "profileForm")
        setMessages((m) => m.map((msg) => (msg.id === messageId ? { ...msg, profileForm: true } : msg)));
      else applyAction(action);
    },
    [addLink, applyAction, router, setMessages, startTour]
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
          finishTurn();
          if (reply.action) runLocalAction(reply.action, id);
        }
      }, TIMING.streamTickMs);
    },
    [finishTurn, runLocalAction, setChatState, setMessages]
  );

  /** Open a bubble, start the voice, and begin typing the moment the voice starts. */
  const deliver = useCallback(
    (reply: JarvisReply) => {
      if (reply.action?.type === "clear") {
        runLocalAction(reply.action, -1);
        finishTurn();
        return;
      }
      const id = nextIdRef.current++;
      setMessages((m) => [...m, { id, from: "jarvis", text: "", time: now() }]);
      setStreamingId(id);
      if (reply.card) showCard(reply.card);
      if (reply.skills) showSkills(reply.skills.category, reply.skills.lit);

      spokenText.current = speechOf(reply);
      let started = false;
      const begin = (voiceSec: number | null) => {
        if (started) return;
        started = true;
        syncCards(speechOf(reply), voiceSec);
        stream(id, reply, voiceSec);
      };
      timers.current.push(setTimeout(() => begin(null), TIMING.voiceStartCapMs));
      void say(speechOf(reply), { onStart: begin });
    },
    [finishTurn, nextIdRef, runLocalAction, say, setMessages, showCard, showSkills, stream, syncCards]
  );

  const answerLocally = useCallback(
    (question: string, note?: string) => {
      const started = performance.now();
      const reply = askJarvis(question, followUpRef.current);
      try {
        navigator.sendBeacon?.(
          LOG_ENDPOINT,
          new Blob([JSON.stringify({ question, page: PAGE_NAMES[pathname] ?? "home" })], { type: "application/json" })
        );
      } catch {
        // Logging is best-effort.
      }
      followUpRef.current = reply.followUp;
      void prefetch(speechOf(reply)); // the voice loads while Jarvis "thinks"
      remember(question, reply.text);
      pushTrace({
        question,
        source: "local",
        tools: [],
        localMs: Math.round(performance.now() - started),
        note,
      });
      timers.current.push(setTimeout(() => deliver(reply), TIMING.thinkMs));
    },
    [deliver, followUpRef, pathname, prefetch, pushTrace, remember]
  );

  // ── AI brain ────────────────────────────────────────────────────────────────

  /** Resolves false when the AI couldn't answer at all (caller falls back to the local brain). */
  const answerWithAI = useCallback(
    async (question: string): Promise<boolean> => {
      const controller = new AbortController();
      inflight.current = controller;
      const id = nextIdRef.current++;
      const tools: ToolTrace[] = [];
      /** Navigation and the tour wait until Jarvis has finished speaking. */
      const afterSpeech: AgentAction[] = [];
      let text = "";
      let unspoken = "";
      let spokeAny = false;
      let metrics: TurnMetrics | undefined;
      let opened = false;
      /**
       * The first hologram goes up straight away; later ones (e.g. arsenal, then
       * a project) are left to the speech sync, which swaps them in as named.
       */
      let hologramShown = false;

      const open = () => {
        if (opened) return;
        opened = true;
        setMessages((m) => [...m, { id, from: "jarvis", text: "", time: now() }]);
        setStreamingId(id);
      };

      const speakChunks = (final: boolean) => {
        const [chunks, rest] = final ? [[unspoken.trim()], ""] : takeSentences(unspoken, !spokeAny);
        unspoken = rest;
        for (const chunk of chunks) {
          if (!chunk) continue;
          enqueue(chunk, { onStart: (durationSec) => syncCards(chunk, durationSec) });
          spokeAny = true;
        }
      };

      const act = (action: AgentAction) => {
        if (action.type === "showProject" || action.type === "showSkills") {
          if (hologramShown) return;
          hologramShown = true;
          if (action.type === "showProject") showCard(action.title);
          else showSkills(action.category);
        } else if (action.type === "theme") setTheme(action.themeId);
        else if (action.type === "profileForm") {
          open();
          setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, profileForm: true } : msg)));
        } else if (action.type === "share") {
          open();
          addLink(id, SHARE_LINKS[action.target]);
        } else afterSpeech.push(action);
      };

      try {
        const res = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...historyRef.current, { role: "user", content: question }],
            page: PAGE_NAMES[pathname] ?? "home",
          }),
          signal: controller.signal,
        });
        if (res.status === 503 || res.status === 404) aiAvailable.current = false;
        if (!res.ok || !res.body) return false;

        for await (const event of readEvents(res.body)) {
          if (event.type === "text") {
            open();
            if (!text) setChatState("responding");
            text += event.delta;
            unspoken += event.delta;
            spokenText.current = text;
            const shown = text;
            setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: shown } : msg)));
            speakChunks(false);
          } else if (event.type === "action") act(event.action);
          else if (event.type === "tool") tools.push({ name: event.name, input: event.input, ok: event.ok });
          else if (event.type === "done") metrics = event.metrics;
          else if (event.type === "error" && !text) {
            pushTrace({ question, source: "ai", tools, note: `AI error: ${event.message} — fell back to local brain` });
            return false;
          }
        }
      } catch (error: unknown) {
        if (isAbort(error)) return true; // interrupted — the bubble was already finalised
        if (!text) return false;
      } finally {
        if (inflight.current === controller) inflight.current = null;
      }

      speakChunks(true);
      remember(question, text);
      pushTrace({ question, source: "ai", metrics, tools });
      finishTurn();

      if (afterSpeech.length) {
        whenQuiet(() => {
          for (const action of afterSpeech) {
            if (action.type === "navigate") router.push(PAGE_PATHS[action.page]);
            else if (action.type === "tour") startTour();
          }
        });
      }
      return true;
    },
    [addLink, enqueue, finishTurn, historyRef, nextIdRef, pathname, pushTrace, remember, router, setChatState, setMessages, setTheme, showCard, showSkills, startTour, syncCards, whenQuiet]
  );

  // ── Interrupt (barge-in) ────────────────────────────────────────────────────

  const interrupt = useCallback(() => {
    clearCardTimers();
    inflight.current?.abort();
    inflight.current = null;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (streamRef.current) clearInterval(streamRef.current);
    streamRef.current = null;
    stop();
    setStreamingId((current) => {
      if (current !== null) {
        setMessages((m) => m.map((msg) => (msg.id === current ? { ...msg, interrupted: true } : msg)));
      }
      return null;
    });
    setBusy(false);
    setChatState("idle");
  }, [clearCardTimers, setChatState, setMessages, stop]);

  const talking = busy || speaking;

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      if (talking) interrupt();
      setInput("");
      setBusy(true);
      clearCardTimers();
      spokenText.current = "";
      hideCard();
      setMessages((m) => [...m, { id: nextIdRef.current++, from: "user", text, time: now() }]);
      setChatState("thinking");

      if (aiAvailable.current === false) {
        answerLocally(text);
        return;
      }
      void answerWithAI(text).then((answered) => {
        if (!answered) answerLocally(text, aiAvailable.current === false ? "AI brain offline" : "AI unavailable — local brain answered");
      });
    },
    [answerLocally, answerWithAI, clearCardTimers, hideCard, interrupt, nextIdRef, setChatState, setMessages, talking]
  );

  // Esc cuts Jarvis off (the tour handles its own Esc).
  useEffect(() => {
    if (!talking || touring) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") interrupt();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interrupt, talking, touring]);

  // ── Greeting + warm-up ──────────────────────────────────────────────────────

  const greetingLine = useRef(isDock ? DOCK_GREETING : greeting());

  // Find out which brain is on duty, then warm the voice for the greeting. The
  // local brain's quick-prompt answers are fixed, so preload those too.
  useEffect(() => {
    let cancelled = false;
    const greetingReady = prefetch(greetingLine.current);
    void fetch(CHAT_ENDPOINT)
      .then((r) => (r.ok ? (r.json() as Promise<{ available: boolean; model: string | null }>) : null))
      .then((info) => {
        if (cancelled || !info) return;
        aiAvailable.current = info.available;
        setAiModel(info.model);
      })
      .catch(() => {
        aiAvailable.current = false;
      });

    const t = setTimeout(async () => {
      await greetingReady;
      if (aiAvailable.current !== false) return;
      for (const p of QUICK_PROMPTS) {
        if (cancelled) return;
        await prefetch(speechOf(askJarvis(p)));
      }
    }, TIMING.warmupDelayMs);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [prefetch]);

  // Jarvis talks first — once per visit, even if the page remounts. Opening the
  // dock mid-conversation just carries on where the visitor left off.
  useEffect(() => {
    if (session.current.greeted || messages.length) return;
    const t = setTimeout(
      () => {
        if (session.current.greeted) return;
        session.current.greeted = true;
        setBusy(true);
        deliver({ text: greetingLine.current });
      },
      isDock ? DOCK_GREETING_DELAY_MS : TIMING.greetingDelayMs
    );
    return () => clearTimeout(t);
    // Only on mount: a conversation that's already started must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliver, session, isDock]);

  // ── Voice input ─────────────────────────────────────────────────────────────

  // Hands-free: the mic stays open. Talking over Jarvis cuts him off and asks the new question.
  const { status: micStatus } = useJarvisListen({
    enabled: micOn,
    paused: touring,
    interruptOnly: talking || orbState !== "idle",
    onInterrupt: interrupt,
    isEcho,
    onFinal: (text) => send(fixHeard(text)),
    onInterim: (text) => setHeard(text ? fixHeard(text) : ""),
  });
  const listening = micStatus === "listening" && !talking;
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
      <button
        type="button"
        onClick={() => setShowTrace((v) => !v)}
        aria-pressed={showTrace}
        aria-label={showTrace ? "Hide what's under the hood" : "Show what's under the hood"}
        title="Under the hood"
        className={`text-sm transition-opacity hover:opacity-70 md:text-lg ${showTrace ? "jv-accent" : "jv-dim"}`}
      >
        <HiCodeBracket />
      </button>
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
      tag={talking ? "LIVE" : listening ? "LISTENING" : "READY"}
      actions={headerActions}
      className={className}
      bodyClassName="relative flex min-h-0 flex-col gap-2"
    >
      <div
        ref={scrollRef}
        className="jv-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 md:space-y-3"
        role="log"
        aria-live="polite"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[92%] px-2.5 py-1.5 md:px-3.5 md:py-2.5 ${
                m.from === "user" ? "jv-bubble-user text-right" : "jv-bubble-ai"
              }`}
            >
              <div className="text-[9px] tracking-widest md:text-xs">
                <span className={m.from === "user" ? "text-textColor" : "jv-accent"}>
                  {m.from === "user" ? "VISITOR" : "J.A.R.V.I.S."}
                </span>
                <span className="jv-dim"> · {m.time}</span>
              </div>
              <p className="whitespace-pre-line break-words text-xs leading-relaxed md:text-[15px] xl:text-base">
                {m.text}
                {m.id === streamingId && <span className="jv-blink jv-accent">▍</span>}
                {m.interrupted && <span className="jv-dim"> —</span>}
              </p>
              {m.profileForm && (
                <ProfileForm
                  getHistory={() => historyRef.current}
                  onSent={(outcome) => {
                    const line =
                      outcome === "emailed"
                        ? "Sent — check your inbox. Zeff's been told you're interested, too."
                        : "Thanks — I've passed your email to Zeff and he'll be in touch personally.";
                    setMessages((all) => [...all, { id: nextIdRef.current++, from: "jarvis", text: line, time: now() }]);
                    void say(line);
                  }}
                />
              )}
              {m.links && m.links.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.links.map((l) => (
                    <a
                      key={l.target}
                      href={l.href}
                      target={l.target === "email" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      download={l.target === "resume" ? true : undefined}
                      className="jv-chip jv-accent inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-widest md:text-xs"
                    >
                      {l.label} {SHARE_ICON[l.target]}
                    </a>
                  ))}
                </div>
              )}
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

      <div className={`flex-wrap gap-1.5 ${isDock ? "flex" : "hidden md:flex"}`}>
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => send(p)}
            className="jv-chip px-2 py-0.5 text-[10px] tracking-wider md:px-2.5 md:py-1 md:text-xs"
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
          onChange={(e) => {
            // Starting to type means the visitor wants the floor.
            if (talking && !input && e.target.value) interrupt();
            setInput(e.target.value);
          }}
          placeholder={
            talking ? "Just talk or type to interrupt…" : listening ? "Listening — just speak, or type here…" : "Ask J.A.R.V.I.S. anything…"
          }
          autoComplete="off"
          className="jv-input min-w-0 flex-1 px-2.5 py-1.5 text-xs placeholder:text-[color:var(--jv-dim)] md:px-3.5 md:py-2.5 md:text-base"
        />
        {talking ? (
          <button
            type="button"
            onClick={interrupt}
            aria-label="Stop J.A.R.V.I.S."
            title="Stop (Esc)"
            className="jv-chip jv-accent inline-flex items-center gap-1 px-3 text-[10px] tracking-widest md:px-4 md:text-xs"
          >
            <HiStop /> STOP
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="jv-chip px-3 text-[10px] tracking-widest disabled:opacity-40 md:px-4 md:text-xs"
          >
            SEND
          </button>
        )}
      </form>

      {showTrace && <UnderTheHood trace={trace} model={aiModel} onClose={() => setShowTrace(false)} />}
    </Panel>
  );
}

// ── Under the hood ──────────────────────────────────────────────────────────

interface UnderTheHoodProps {
  trace: TraceEntry[];
  model: string | null;
  onClose: () => void;
}

const fmtMs = (ms: number | null | undefined) =>
  ms == null ? "—" : ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
const fmtN = (n: number) => n.toLocaleString();

/** Live engineering readout: which brain answered, latency, tokens and every tool call. */
function UnderTheHood({ trace, model, onClose }: UnderTheHoodProps) {
  return (
    <div className="jv-trace jv-scroll absolute inset-0 z-10 overflow-y-auto p-2.5 font-mono text-[10px] leading-relaxed md:p-3 md:text-xs">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="jv-accent tracking-widest">UNDER THE HOOD</p>
          <p className="jv-dim">
            {model ? `${model} · grounded on portfolio data · 7 UI tools · streamed NDJSON` : "local intent brain (no API key) · deterministic"}
          </p>
          <p className="jv-dim">voice: sentence-chunked TTS · 2-slot upstream queue · CDN-cached lines</p>
        </div>
        <button type="button" onClick={onClose} className="jv-chip shrink-0 px-2 py-0.5 tracking-widest">
          CLOSE
        </button>
      </div>
      {trace.length === 0 ? (
        <p className="jv-dim">Ask something — each request will be traced here.</p>
      ) : (
        <ol className="space-y-2">
          {trace.map((t) => (
            <li key={t.id} className="border-l border-[color:var(--jv-line)] pl-2">
              <p>
                <span className="jv-dim">{t.time}</span>{" "}
                <span className="jv-accent">{t.source === "ai" ? "AI" : "LOCAL"}</span>{" "}
                <span className="break-words">“{t.question}”</span>
              </p>
              {t.metrics && (
                <>
                  <p className="jv-dim">
                    first word {fmtMs(t.metrics.ttftMs)} · total {fmtMs(t.metrics.totalMs)} · {t.metrics.turns}{" "}
                    {t.metrics.turns === 1 ? "turn" : "turns"}
                  </p>
                  <p className="jv-dim">
                    tokens {fmtN(t.metrics.inputTokens)} in ({fmtN(t.metrics.cachedTokens)} cached) ·{" "}
                    {fmtN(t.metrics.outputTokens)} out
                  </p>
                </>
              )}
              {t.localMs != null && <p className="jv-dim">intent matched in {fmtMs(t.localMs)}</p>}
              {t.tools.map((tool, i) => (
                <p key={i} className="break-all">
                  <span className="jv-accent">→ {tool.name}</span>
                  <span className="jv-dim"> {JSON.stringify(tool.input)}</span> {tool.ok ? "✓" : "✗"}
                </p>
              ))}
              {t.note && <p className="jv-dim italic">{t.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
