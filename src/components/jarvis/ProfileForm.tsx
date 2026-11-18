"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { HiEnvelope } from "react-icons/hi2";
import { CONTACT } from "./portfolio";
import type { ChatTurn } from "./chatProtocol";

/**
 * "Email me his profile", inline in the chat. Sends two emails through the
 * site's EmailJS account:
 *  1. to the visitor — a summary tailored to their conversation + résumé link
 *     (needs NEXT_PUBLIC_EMAILJS_PROFILE_TEMPLATE_ID; see docs/JARVIS.md)
 *  2. to Zeff — a lead notification via the existing contact-form template
 * Without the profile template, only (2) is sent and the visitor is told Zeff
 * will follow up personally.
 */

const BRIEF_ENDPOINT = "/api/jarvis/brief";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMAILJS = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  contactTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  profileTemplateId: process.env.NEXT_PUBLIC_EMAILJS_PROFILE_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
} as const;

interface BriefResponse {
  summary: string;
  tailored: boolean;
  questions: string[];
}

type Status = "idle" | "sending" | "sent" | "error" | "unavailable";

interface ProfileFormProps {
  /** The conversation so far (read at send time). */
  getHistory: () => ChatTurn[];
  /** Jarvis confirms in the chat once it's sent. */
  onSent: (outcome: "emailed" | "lead-only") => void;
}

export default function ProfileForm({ getHistory, onSent }: ProfileFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const valid = EMAIL_PATTERN.test(email.trim());

  const submit = async () => {
    const to = email.trim();
    if (!EMAIL_PATTERN.test(to) || status === "sending") return;
    if (!EMAILJS.serviceId || !EMAILJS.publicKey) {
      setStatus("unavailable");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(BRIEF_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: getHistory() }),
      });
      if (!res.ok) throw new Error(`brief ${res.status}`);
      const brief = (await res.json()) as BriefResponse;
      const origin = window.location.origin;
      const resumeUrl = new URL(CONTACT.resume, origin).toString();

      const visitorEmail = EMAILJS.profileTemplateId
        ? emailjs.send(
            EMAILJS.serviceId,
            EMAILJS.profileTemplateId,
            { to_email: to, summary: brief.summary, resume_url: resumeUrl, portfolio_url: origin, contact_email: CONTACT.email },
            { publicKey: EMAILJS.publicKey }
          )
        : Promise.resolve(null);

      // Lead notification for Zeff, through the contact form's template (name / email / message).
      const leadEmail = EMAILJS.contactTemplateId
        ? emailjs.send(
            EMAILJS.serviceId,
            EMAILJS.contactTemplateId,
            {
              name: "J.A.R.V.I.S. lead",
              email: to,
              message: [
                `${to} asked J.A.R.V.I.S. for your profile.`,
                "",
                "What they asked:",
                ...brief.questions.map((q) => `• ${q}`),
                "",
                `Summary sent${brief.tailored ? " (tailored)" : ""}:`,
                brief.summary,
              ].join("\n"),
            },
            { publicKey: EMAILJS.publicKey }
          )
        : Promise.resolve(null);

      await Promise.all([visitorEmail, leadEmail]);
      setStatus("sent");
      onSent(EMAILJS.profileTemplateId ? "emailed" : "lead-only");
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "text" in error ? String((error as { text: unknown }).text) : "send failed";
      console.error(`[jarvis-profile] ${message}`);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return <p className="jv-accent mt-1.5 text-[10px] tracking-widest md:text-xs">✓ SENT</p>;
  }

  return (
    <>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="mt-2 flex gap-1.5"
    >
      <label htmlFor="jarvis-profile-email" className="sr-only">
        Your email
      </label>
      <input
        id="jarvis-profile-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        className="jv-input min-w-0 flex-1 px-2 py-1 text-xs md:text-sm"
      />
      <button
        type="submit"
        disabled={!valid || status === "sending"}
        className="jv-chip jv-accent inline-flex items-center gap-1 px-2.5 text-[10px] tracking-widest disabled:opacity-40 md:text-xs"
      >
        <HiEnvelope /> {status === "sending" ? "SENDING…" : status === "error" ? "RETRY" : "SEND"}
      </button>
    </form>
    {(status === "error" || status === "unavailable") && (
      <p className="jv-dim mt-1 text-[10px] md:text-xs" role="alert">
        {status === "error"
          ? "Couldn't send that — try again, or use the contact page."
          : "Email isn't set up on this site yet — please use the contact page."}
      </p>
    )}
    </>
  );
}
