"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { JarvisAction } from "./jarvisBrain";
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
  say: (text: string, hooks?: SayHooks) => Promise<void>;
  /** Warm the audio for a line before it is spoken (hides network latency). */
  prefetch: (text: string) => void;
  /** A line is waiting for the first click/tap (browsers block sound until then). */
  audioBlocked: boolean;
  /** Live loudness of the neural voice (0..1), or -1 when there is no audio stream. */
  level: () => number;
  /** Apply the UI-level actions the brain can return (theme / power save / voice). */
  applyAction: (action: JarvisAction) => void;
}

const JarvisContext = createContext<JarvisContextValue | null>(null);

export const useJarvis = (): JarvisContextValue => {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error("useJarvis must be used inside <JarvisProvider>");
  return ctx;
};

interface JarvisProviderProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Shared J.A.R.V.I.S. state so the orb, comms, waveform and vitals can live in
 * different spots of the hero yet behave as one system. Also scopes the
 * `--jv-hue` theme variable to its subtree. Voice is ON by default.
 */
export default function JarvisProvider({ className, children }: JarvisProviderProps) {
  const [chatState, setChatState] = useState<OrbState>("idle");
  const [themeId, setThemeId] = usePref(STORAGE_KEYS.theme, DEFAULT_THEME_ID);
  const [voicePref, setVoicePref] = usePref(STORAGE_KEYS.voice, "1");
  const [powerSavePref, setPowerSavePref] = usePref(STORAGE_KEYS.powerSave, "0");

  const voice = voicePref === "1";
  const powerSave = powerSavePref === "1";
  const theme = findTheme(themeId);
  const { say, prefetch, speaking, audioBlocked, level } = useJarvisVoice(voice);

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
      prefetch,
      audioBlocked,
      level,
      applyAction,
    }),
    [orbState, theme, setThemeId, voice, setVoice, powerSave, setPowerSave, say, prefetch, audioBlocked, level, applyAction]
  );

  return (
    <JarvisContext.Provider value={value}>
      <div
        className={`jv-root ${powerSave ? "jv-power-save" : ""} ${className ?? ""}`}
        style={{ ["--jv-hue" as string]: theme.hue }}
      >
        {children}
      </div>
    </JarvisContext.Provider>
  );
}
