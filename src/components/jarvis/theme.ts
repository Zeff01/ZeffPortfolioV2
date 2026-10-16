/**
 * Shared J.A.R.V.I.S. console types + theme palette.
 *
 * Every console surface reads its accent from the `--jv-hue` CSS variable, so
 * switching theme is a single hue rotation (same approach as openclaw-jarvis-ui).
 */

export type OrbState = "idle" | "thinking" | "responding";

export interface JarvisTheme {
  id: string;
  name: string;
  hue: number;
}

export const JARVIS_THEMES: JarvisTheme[] = [
  { id: "mark", name: "Mark III", hue: 2 },
  { id: "gold", name: "Gold Titanium", hue: 40 },
  { id: "arc", name: "Arc Cyan", hue: 186 },
  { id: "hulk", name: "Hulkbuster", hue: 145 },
  { id: "stealth", name: "Stealth", hue: 215 },
  { id: "vibranium", name: "Vibranium", hue: 275 },
];

export const DEFAULT_THEME_ID = "mark";

export const STORAGE_KEYS = {
  theme: "jarvis.theme",
  powerSave: "jarvis.powerSave",
  voice: "jarvis.voice",
  mic: "jarvis.mic",
} as const;

export const ORB_STATE_LABEL: Record<OrbState, string> = {
  idle: "IDLE",
  thinking: "THINKING",
  responding: "RESPONDING",
};

export const findTheme = (id: string): JarvisTheme =>
  JARVIS_THEMES.find((t) => t.id === id) ?? JARVIS_THEMES[0];

/** localStorage can throw (private mode, blocked storage) — never let it break the UI. */
export const readStored = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStored = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage unavailable — preference just won't persist
  }
};
