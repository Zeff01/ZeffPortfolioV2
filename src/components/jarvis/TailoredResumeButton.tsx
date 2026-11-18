"use client";

import { useState } from "react";
import { HiArrowDownTray } from "react-icons/hi2";
import { RESUME_PDF_PATH } from "@/lib/site";

const FILENAME = "Zeff-Somera-Resume-Tailored.pdf";

type Status = "idle" | "working" | "done" | "error";

interface TailoredResumeButtonProps {
  /** The role's requirements, as Jarvis understood them. */
  job: string;
}

/** In-chat button: downloads Zeff's CV rewritten for the role the visitor described. */
export default function TailoredResumeButton({ job }: TailoredResumeButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [focus, setFocus] = useState("");

  const download = async () => {
    if (status === "working") return;
    setStatus("working");
    try {
      const res = await fetch(RESUME_PDF_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      if (!res.ok) throw new Error(`tailor ${res.status}`);
      setFocus(decodeURIComponent(res.headers.get("X-Resume-Focus") ?? ""));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = FILENAME;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => void download()}
        disabled={status === "working"}
        className="jv-chip jv-accent inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-widest disabled:opacity-60 md:text-xs"
      >
        {status === "working" ? "TAILORING…" : status === "done" ? "DOWNLOAD AGAIN" : "TAILORED RÉSUMÉ"}{" "}
        <HiArrowDownTray />
      </button>
      {status === "done" && focus && <p className="jv-dim mt-1 text-[10px] md:text-xs">Tailored for {focus}.</p>}
      {status === "error" && (
        <p className="jv-dim mt-1 text-[10px] md:text-xs" role="alert">
          Couldn&apos;t tailor it right now — the standard résumé is on the Résumé page.
        </p>
      )}
    </div>
  );
}
