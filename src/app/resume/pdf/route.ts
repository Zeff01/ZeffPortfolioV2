import React from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildResume, projectCandidates, RESUME_FILENAME, type ResumeData } from "@/lib/resume";
import { ResumeDocument } from "@/lib/ResumeDocument";
import { smartResumeWithin } from "@/lib/resumeAI";
import { SITE_URL } from "@/lib/site";

/**
 * GET  /resume/pdf             — the CV, AI-polished from the portfolio data
 *                                (`?download=1` saves it, otherwise it opens inline)
 *
 * Without an API key it serves the plain data-built CV.
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


/** Headshot for the header (bundled via outputFileTracingIncludes in next.config.js). */
const PHOTO_PATH = path.join(process.cwd(), "public", "resume", "avatar.jpg");
let photo: Promise<Buffer | undefined> | undefined;
const loadPhoto = () => (photo ??= readFile(PHOTO_PATH).catch(() => undefined));

const render = async (resume: ResumeData) => {
  const element = React.createElement(ResumeDocument, {
    resume,
    source: SITE_URL.replace(/^https?:\/\//, ""),
    photo: await loadPhoto(),
  });
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
