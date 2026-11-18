"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { JarvisAction } from "./jarvisBrain";
import { findProject, type PortfolioProject } from "./portfolio";
import type { ChatMessage, ChatTurn, TraceEntry } from "./chatProtocol";

/** What the hologram over the hero is showing. */
export type HoloContent =
  | { kind: "project"; project: PortfolioProject }
  /** The tech arsenal: one category (or all), with the skills Jarvis has named lit up. */
  | { kind: "skills"; category: string | null; lit: string[] };
import { usePref } from "./usePref";
import { useJarvisVoice, type SayHooks } from "./useJarvisVoice";
import { DEFAULT_THEME_ID, STORAGE_KEYS, findTheme, type JarvisTheme, type OrbState } from "./theme";

interface JarvisContextValue {
  /** What the chat is doing; the orb / waveform / vitals read the merged `orbState`. */
  setChatState: (state: OrbState) => void;
  orbState: OrbState;
  theme: JarvisTheme;
  setTheme: (id: string) => void;
  voice: boolean;
  setVoice: (on: boolean) => void;
  powerSave: boolean;
  setPowerSave: (on: boolean) => void;
  /** Speak one line (cancels anything in progress). */
  say: (text: string, hooks?: SayHooks) => Promise<void>;
  /** Speak streamed sentences back to back. */
  enqueue: (text: string, hooks?: SayHooks) => void;
  /** Run once everything queued has been said. */
  whenQuiet: (cb: () => void) => void;
  /** Cut Jarvis off mid-sentence. */
  stop: () => void;
  speaking: boolean;
  /** Warm the audio for a line before it is spoken (hides network latency). */
  prefetch: (text: string) => Promise<void>;
  /** A line is waiting for the first click/tap (browsers block sound until then). */
  audioBlocked: boolean;
  /** Live loudness of the neural voice (0..1), or -1 when there is no audio stream. */
  level: () => number;
  /** Apply the UI-level actions the brain can return (theme / power save / voice). */
  applyAction: (action: JarvisAction) => void;
  /** The hologram on screen, if any. */
  card: HoloContent | null;
  showCard: (title: string) => void;
  /** Show the tech arsenal (one category or all), optionally with skills already lit. */
  showSkills: (category: string | null, lit?: string[]) => void;
  /** Light a skill up on the arsenal, if it's showing. */
  lightSkill: (title: string) => void;
  hideCard: () => void;
  /** Guided tour across the site's pages. */
  touring: boolean;
  startTour: () => void;
  endTour: () => void;
  /** Once-per-visit flags that must survive the home page unmounting (e.g. during the tour). */
  session: React.RefObject<{ greeted: boolean }>;
  /** The conversation — kept here so it follows the visitor from page to page. */
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  trace: TraceEntry[];
  setTrace: React.Dispatch<React.SetStateAction<TraceEntry[]>>;
  /** Message id counter, the AI's view of the conversation, and the local brain's "tell me more". */
  chatIdsRef: React.RefObject<number>;
  chatHistoryRef: React.RefObject<ChatTurn[]>;
  chatFollowUpRef: React.RefObject<string | undefined>;
}

const JarvisContext = createContext<JarvisContextValue | null>(null);

export const useJarvis = (): JarvisContextValue => {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error("useJarvis must be used inside <JarvisProvider>");
  return ctx;
};

/**
 * Site-wide J.A.R.V.I.S. state, so the orb, comms, waveform, vitals, project
 * cards and the guided tour behave as one system — and so his voice keeps
 * going when the tour moves between pages. Voice is ON by default.
 */
export default function JarvisProvider({ children }: { children: React.ReactNode }) {
  const [chatState, setChatState] = useState<OrbState>("idle");
  const [themeId, setThemeId] = usePref(STORAGE_KEYS.theme, DEFAULT_THEME_ID);
  const [voicePref, setVoicePref] = usePref(STORAGE_KEYS.voice, "1");
  const [powerSavePref, setPowerSavePref] = usePref(STORAGE_KEYS.powerSave, "0");
  const [shown, setShown] = useState<{ content: HoloContent; path: string } | null>(null);
  const [touring, setTouring] = useState(false);
  const session = useRef({ greeted: false });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const chatIdsRef = useRef(0);
  const chatHistoryRef = useRef<ChatTurn[]>([]);
  const chatFollowUpRef = useRef<string | undefined>(undefined);
  const pathname = usePathname();
  // A card belongs to the page it was shown on: leave the page and it's gone.
  const card = shown && shown.path === pathname ? shown.content : null;

  const voice = voicePref === "1";
  const powerSave = powerSavePref === "1";
  const theme = findTheme(themeId);
  const { say, enqueue, whenQuiet, stop, prefetch, speaking, audioBlocked, level } = useJarvisVoice(voice);

  // Speech can outlast the typewriter (or start late, after a blocked autoplay).
  const orbState: OrbState = chatState === "idle" && speaking ? "responding" : chatState;

  const setVoice = useCallback((on: boolean) => setVoicePref(on ? "1" : "0"), [setVoicePref]);
  const setPowerSave = useCallback((on: boolean) => setPowerSavePref(on ? "1" : "0"), [setPowerSavePref]);

  const applyAction = useCallback(
    (action: JarvisAction) => {
      if (action.type === "theme") setThemeId(action.themeId);
      else if (action.type === "powerSave") setPowerSave(action.on);
      else if (action.type === "voice") setVoice(action.on);
    },
    [setThemeId, setPowerSave, setVoice]
  );

  const showCard = useCallback(
    (title: string) => {
      const project = findProject(title);
      setShown(project ? { content: { kind: "project", project }, path: pathname } : null);
    },
    [pathname]
  );
  const showSkills = useCallback(
    (category: string | null, lit: string[] = []) =>
      setShown({ content: { kind: "skills", category, lit }, path: pathname }),
    [pathname]
  );
  const lightSkill = useCallback(
    (title: string) =>
      setShown((prev) =>
        prev?.content.kind === "skills" && !prev.content.lit.includes(title)
          ? { ...prev, content: { ...prev.content, lit: [...prev.content.lit, title] } }
          : prev
      ),
    []
  );
  const hideCard = useCallback(() => setShown(null), []);
  const startTour = useCallback(() => {
    setShown(null);
    setTouring(true);
  }, []);
  const endTour = useCallback(() => setTouring(false), []);

  const value = useMemo<JarvisContextValue>(
    () => ({
      setChatState,
      orbState,
      theme,
      setTheme: setThemeId,
      voice,
      setVoice,
      powerSave,
      setPowerSave,
      say,
      enqueue,
      whenQuiet,
      stop,
      speaking,
      prefetch,
      audioBlocked,
      level,
      applyAction,
      card,
      showCard,
      showSkills,
      lightSkill,
      hideCard,
      touring,
      startTour,
      endTour,
      session,
      messages,
      setMessages,
      trace,
      setTrace,
      chatIdsRef,
      chatHistoryRef,
      chatFollowUpRef,
    }),
    [
      orbState, theme, setThemeId, voice, setVoice, powerSave, setPowerSave, say, enqueue, whenQuiet, stop, speaking,
      prefetch, audioBlocked, level, applyAction, card, showCard, showSkills, lightSkill, hideCard, touring, startTour, endTour, messages, trace,
    ]
  );

  return <JarvisContext.Provider value={value}>{children}</JarvisContext.Provider>;
}

interface JarvisRootProps {
  className?: string;
  children: React.ReactNode;
}

/** Scopes the `--jv-hue` theme variable (and power-save mode) to a J.A.R.V.I.S. surface. */
export function JarvisRoot({ className, children }: JarvisRootProps) {
  const { theme, powerSave } = useJarvis();
  return (
    <div
      className={`jv-root ${powerSave ? "jv-power-save" : ""} ${className ?? ""}`}
      style={{ ["--jv-hue" as string]: theme.hue }}
    >
      {children}
    </div>
  );
}
