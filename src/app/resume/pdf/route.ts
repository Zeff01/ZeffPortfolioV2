import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildResume, projectCandidates, RESUME_FILENAME, type ResumeData } from "@/lib/resume";
import { ResumeDocument } from "@/lib/ResumeDocument";
import { smartResume, smartResumeWithin, RESUME_JOB_MAX_CHARS } from "@/lib/resumeAI";
import { SITE_URL } from "@/lib/site";

/**
 * GET  /resume/pdf             — the CV, AI-polished from the portfolio data
 *                                (`?download=1` saves it, otherwise it opens inline)
 * POST /resume/pdf {job}       — the CV tailored to a job description
 *
 * Without an API key both serve the plain data-built CV.
 */

export const runtime = "nodejs";

const CACHE = {
  /** The AI version: cache at the edge for a day. */
  enhanced: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  /** The plain stand-in (AI still writing): cache briefly so the AI version takes over soon. */
  plain: "public, max-age=0, s-maxage=60",
} as const;
/** A download should never hang on the model; past this, serve the plain CV. */
const MAX_WAIT_MS = 8000;
const TAILORED_FILENAME = "Zeff-Somera-Resume-Tailored.pdf";
const MIN_JOB_CHARS = 40;

/** Tailoring calls the model per job — keep it to a sensible rate per visitor. */
const RATE = { windowMs: 3_600_000, perWindow: 10, maxTracked: 5000 } as const;
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  if (hits.size > RATE.maxTracked) hits.clear();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE.perWindow;
};

const render = async (resume: ResumeData) => {
  const element = React.createElement(ResumeDocument, { resume, source: SITE_URL.replace(/^https?:\/\//, "") });
  // renderToBuffer expects a <Document> element; ResumeDocument renders one.
  return renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
};

export async function GET(req: Request) {
  const download = new URL(req.url).searchParams.get("download") === "1";
  const { resume, enhanced } = await smartResumeWithin(buildResume(), projectCandidates(), MAX_WAIT_MS);
  const buffer = await render(resume);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${RESUME_FILENAME}"`,
      "Cache-Control": enhanced ? CACHE.enhanced : CACHE.plain,
    },
  });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "Too many tailored résumés — try again later." }, { status: 429 });

  const body: unknown = await req.json().catch(() => null);
  const job =
    body && typeof body === "object" && "job" in body && typeof body.job === "string" ? body.job.trim() : "";
  if (job.length < MIN_JOB_CHARS) {
    return Response.json({ error: "Paste a bit more of the job description." }, { status: 400 });
  }

  const { resume, enhanced, focus } = await smartResume(buildResume(), projectCandidates(), job.slice(0, RESUME_JOB_MAX_CHARS));
  const buffer = await render(resume);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${TAILORED_FILENAME}"`,
      "Cache-Control": "no-store",
      // Shown to the visitor: what this version emphasises.
      "X-Resume-Tailored": enhanced ? "1" : "0",
      "X-Resume-Focus": encodeURIComponent(focus ?? ""),
    },
  });
}
