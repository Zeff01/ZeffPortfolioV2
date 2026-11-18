import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { buildKnowledgeBase, CONTACT } from "@/components/jarvis/portfolio";
import { CHAT_LIMITS, type ChatTurn } from "@/components/jarvis/chatProtocol";

/**
 * "Email me his profile": a short summary of Zeff tailored to what this
 * visitor asked about, for the email Jarvis sends them. Falls back to a fixed
 * summary when there's no API key or the call fails — the email still goes.
 */

export const runtime = "nodejs";

const CONFIG = {
  model: process.env.JARVIS_MODEL || "claude-opus-5-5",
  maxTokens: 2048,
} as const;

const RATE = { windowMs: 3_600_000, perWindow: 5, maxTracked: 5000 } as const;
const hits = new Map<string, number[]>();

const limited = (ip: string) => {
  const now = Date.now();
  if (hits.size > RATE.maxTracked) hits.clear();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE.perWindow;
};

const FALLBACK_SUMMARY =
  `${CONTACT.name} is an AI engineer and full-stack developer who also builds on the blockchain, with ` +
  `${CONTACT.yearsExperience} years of experience shipping products for teams in the US, the UK and Australia. ` +
  "Recent work includes RepairCoin at FixFlow (a blockchain and AI rewards platform with a React Native app), " +
  "Halrcall at Halrtech (an AI marketing automation platform) and AskLuci at Physiocall (a clinic engagement platform). " +
  "His core stack is TypeScript, React and Next.js, Node and Supabase, React Native for mobile, and Solidity on chain.";

const SYSTEM = `You write the body of a short email that Zeff Somera's portfolio assistant sends to a visitor who asked for his profile.

Write 90 to 140 words of plain text, no markdown, no greeting line and no sign-off (the template adds those). Third person about Zeff. Lead with whatever the visitor seemed most interested in during the conversation, connecting it to concrete projects and experience. Use only facts from the portfolio below; never invent metrics, clients or dates. End with one sentence inviting them to reply or book a chat.

<portfolio>
${buildKnowledgeBase()}
</portfolio>`;

const isTurn = (v: unknown): v is ChatTurn =>
  !!v &&
  typeof v === "object" &&
  "role" in v &&
  "content" in v &&
  (v.role === "user" || v.role === "assistant") &&
  typeof v.content === "string";

const transcript = (body: unknown): string => {
  if (!body || typeof body !== "object" || !("messages" in body) || !Array.isArray(body.messages)) return "";
  return body.messages
    .filter(isTurn)
    .slice(-CHAT_LIMITS.maxTurns)
    .map((t) => `${t.role === "user" ? "Visitor" : "Assistant"}: ${t.content.slice(0, CHAT_LIMITS.maxChars)}`)
    .join("\n");
};

let client: Anthropic | null = null;

async function tailoredSummary(conversation: string): Promise<string | null> {
  if (!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) || !conversation) return null;
  client ??= new Anthropic();
  const message = await client.messages.create({
    model: CONFIG.model,
    max_tokens: CONFIG.maxTokens,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `<conversation>\n${conversation}\n</conversation>\n\nWrite the email body.` }],
  });
  if (message.stop_reason === "refusal") return null;
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return text || null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "slow down" }, { status: 429 });

  const body: unknown = await req.json().catch(() => null);
  const conversation = transcript(body);

  let summary = FALLBACK_SUMMARY;
  let tailored = false;
  try {
    const written = await tailoredSummary(conversation);
    if (written) {
      summary = written;
      tailored = true;
    }
  } catch (error: unknown) {
    const message = error instanceof Anthropic.APIError ? `API error ${error.status}` : "request failed";
    console.error(`[jarvis-brief] ${message} — using the standard summary`);
  }

  // The visitor's questions, for Zeff's lead notification (their own words, already on screen to them).
  const questions =
    body && typeof body === "object" && "messages" in body && Array.isArray(body.messages)
      ? body.messages.filter(isTurn).filter((t) => t.role === "user").map((t) => t.content.slice(0, CHAT_LIMITS.maxChars))
      : [];

  return NextResponse.json({ summary, tailored, questions });
}
