import { NextResponse, type NextRequest } from "next/server";
import { logQuestion } from "@/lib/jarvisLog";

/**
 * Logs questions answered by the local (in-browser) brain. Questions answered
 * by the AI are logged by /api/jarvis/chat itself. Anonymous — see jarvisLog.ts.
 */

export const runtime = "nodejs";

const PAGES = new Set(["home", "about", "projects", "contact"]);
const MAX_BODY_CHARS = 2000;

/** Coarse abuse guard — counts per IP per minute, never stored with the log. */
const RATE = { windowMs: 60_000, perWindow: 20, maxTracked: 5000 } as const;
const hits = new Map<string, number[]>();

const limited = (ip: string) => {
  const now = Date.now();
  if (hits.size > RATE.maxTracked) hits.clear();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE.perWindow;
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return new NextResponse(null, { status: 429 });

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return new NextResponse(null, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!body || typeof body !== "object") return new NextResponse(null, { status: 400 });
  const { question, page } = body as Record<string, unknown>;
  if (typeof question !== "string" || !question.trim()) return new NextResponse(null, { status: 400 });

  await logQuestion({
    question,
    page: typeof page === "string" && PAGES.has(page) ? page : "home",
    brain: "local",
  });
  return new NextResponse(null, { status: 204 });
}
