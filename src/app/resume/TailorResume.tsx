"use client";

import { useState } from "react";
import { RESUME_PDF_PATH } from "@/lib/site";

const MIN_JOB_CHARS = 40;
const MAX_JOB_CHARS = 6000;

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; focus: string; tailored: boolean }
  | { kind: "error"; message: string };

/** Save a PDF blob with a filename (no new tab, no popup blockers). */
const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * "Tailor to a job": paste a job description, get Zeff's CV re-angled toward
 * it — same facts, re-ordered and re-phrased by the AI to match the role.
 */
export default function TailorResume() {
  const [job, setJob] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const ready = job.trim().length >= MIN_JOB_CHARS && status.kind !== "working";

  const tailor = async () => {
    if (!ready) return;
    setStatus({ kind: "working" });
    try {
      const res = await fetch(RESUME_PDF_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus({ kind: "error", message: err?.error ?? "Couldn't tailor it right now — please try again." });
        return;
      }
      const focus = decodeURIComponent(res.headers.get("X-Resume-Focus") ?? "");
      const tailored = res.headers.get("X-Resume-Tailored") === "1";
      saveBlob(await res.blob(), "Zeff-Somera-Resume-Tailored.pdf");
      setStatus({ kind: "done", focus, tailored });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server — please try again." });
    }
  };

  return (
    <section className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.04] p-5 backdrop-blur sm:p-7">
      <h2 className="mb-1 font-tech text-xs uppercase tracking-[0.3em] text-cyan-300">Tailor to your role</h2>
      <p className="mb-4 text-sm text-gray-400">
        Hiring? Paste the job description and J.A.R.V.I.S. will re-angle this résumé toward it — same facts, re-ordered
        and re-phrased around what the role needs.
      </p>
      <label htmlFor="tailor-job" className="sr-only">
        Job description
      </label>
      <textarea
        id="tailor-job"
        value={job}
        onChange={(e) => setJob(e.target.value.slice(0, MAX_JOB_CHARS))}
        rows={6}
        placeholder="Paste the job description here…"
        className="w-full resize-y rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-gray-200 placeholder:text-gray-500 focus:border-cyan-400/60 focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void tailor()}
          disabled={!ready}
          className="rounded-lg bg-cyan-400 px-5 py-2.5 font-bold text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status.kind === "working" ? "Tailoring… (about 10s)" : "Tailor & download PDF"}
        </button>
        <span className="text-xs text-gray-500" aria-live="polite">
          {status.kind === "done" &&
            (status.tailored
              ? `Downloaded — tailored for ${status.focus || "this role"}.`
              : "Downloaded the standard résumé (tailoring is unavailable right now).")}
          {status.kind === "error" && <span className="text-red-400">{status.message}</span>}
        </span>
      </div>
    </section>
  );
}
