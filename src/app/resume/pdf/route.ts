import React from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import {
  buildResume,
  projectCandidates,
  RESUME_FILENAME,
  RESUME_ONE_PAGE_FILENAME,
  ONE_PAGE_CUTS,
  toOnePage,
  type ResumeData,
} from "@/lib/resume";
import { ResumeDocument } from "@/lib/ResumeDocument";
import { smartResumeWithin } from "@/lib/resumeAI";
import { SITE_URL } from "@/lib/site";

/**
 * GET /resume/pdf            — the CV, AI-polished from the portfolio data
 *     ?pages=1                — the condensed single-page version
 *     ?download=1             — save it instead of opening inline
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

/** QR code in the header → the live portfolio. */
const QR = { width: 240, margin: 1, dark: "#0b1220", light: "#ffffff" } as const;
let qr: Promise<Buffer | undefined> | undefined;
const loadQr = () =>
  (qr ??= QRCode.toBuffer(SITE_URL, {
    type: "png",
    width: QR.width,
    margin: QR.margin,
    errorCorrectionLevel: "M",
    color: { dark: QR.dark, light: QR.light },
  }).catch(() => undefined));

/** Headshot for the header (bundled via outputFileTracingIncludes in next.config.js). */
const PHOTO_PATH = path.join(process.cwd(), "public", "resume", "avatar.jpg");
let photo: Promise<Buffer | undefined> | undefined;
const loadPhoto = () => (photo ??= readFile(PHOTO_PATH).catch(() => undefined));

const render = async (resume: ResumeData, compact: boolean) => {
  const [photoData, qrData] = await Promise.all([loadPhoto(), loadQr()]);
  const element = React.createElement(ResumeDocument, {
    resume,
    source: SITE_URL.replace(/^https?:\/\//, ""),
    photo: photoData,
    qr: qrData,
    compact,
  });
  // renderToBuffer expects a <Document> element; ResumeDocument renders one.
  return renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
};

/** pdfkit writes each page as an uncompressed `/Type /Page` object. */
const pageCount = (pdf: Buffer) => (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;

/** Render the fullest single-page cut that actually fits on one page. */
const renderOnePage = async (resume: ResumeData) => {
  let pdf: Buffer | undefined;
  for (const cut of ONE_PAGE_CUTS) {
    pdf = await render(toOnePage(resume, cut), true);
    if (pageCount(pdf) <= 1) return pdf;
  }
  return pdf as Buffer;
};

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const download = params.get("download") === "1";
  const onePage = params.get("pages") === "1";
  const { resume, enhanced } = await smartResumeWithin(buildResume(), projectCandidates(), MAX_WAIT_MS);
  const buffer = onePage ? await renderOnePage(resume) : await render(resume, false);
  const filename = onePage ? RESUME_ONE_PAGE_FILENAME : RESUME_FILENAME;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": enhanced ? CACHE.enhanced : CACHE.plain,
    },
  });
}
