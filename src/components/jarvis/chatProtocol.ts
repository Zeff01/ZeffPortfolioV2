/**
 * Wire format between /api/jarvis/chat and the comms panel: newline-delimited
 * JSON, one ChatEvent per line.
 */

export type JarvisPage = "home" | "about" | "projects" | "contact";
export type ShareTarget = "github" | "linkedin" | "resume" | "email";

/** UI actions the AI can trigger through its tools. */
export type AgentAction =
  | { type: "showProject"; title: string }
  /** Tech arsenal hologram; null category = everything. */
  | { type: "showSkills"; category: string | null }
  | { type: "navigate"; page: JarvisPage }
  | { type: "share"; target: ShareTarget }
  | { type: "theme"; themeId: string }
  | { type: "tour" }
  /** Put the "email me his profile" form in the reply. */
  | { type: "profileForm" };

export interface TurnMetrics {
  model: string;
  /** Time to the first visible word, ms (first turn only). */
  ttftMs: number | null;
  totalMs: number;
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
  turns: number;
}

export type ChatEvent =
  | { type: "text"; delta: string }
  | { type: "action"; action: AgentAction }
  | { type: "tool"; name: string; input: unknown; ok: boolean }
  | { type: "done"; metrics: TurnMetrics }
  | { type: "error"; message: string };

// ── Chat transcript (kept site-wide so a conversation follows the visitor) ──

export interface ShareLink {
  target: ShareTarget;
  label: string;
  href: string;
}

export interface ChatMessage {
  id: number;
  from: "user" | "jarvis";
  text: string;
  time: string;
  links?: ShareLink[];
  /** Cut off by the visitor. */
  interrupted?: boolean;
  /** Show the "email me his profile" form under this message. */
  profileForm?: boolean;
}

export interface ToolTrace {
  name: string;
  input: unknown;
  ok: boolean;
}

export interface TraceEntry {
  id: number;
  time: string;
  question: string;
  source: "ai" | "local";
  metrics?: TurnMetrics;
  tools: ToolTrace[];
  localMs?: number;
  note?: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export const CHAT_LIMITS = {
  maxTurns: 12,
  maxChars: 600,
} as const;

export const PAGE_PATHS: Record<JarvisPage, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  contact: "/contact",
};
