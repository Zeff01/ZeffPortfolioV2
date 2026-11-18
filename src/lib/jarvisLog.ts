/**
 * Anonymous log of what visitors ask J.A.R.V.I.S. — so Zeff can see what
 * recruiters actually want to know.
 *
 * Privacy: no IP, no user agent, no cookies, no session id. The question
 * itself is scrubbed of emails, phone numbers and long digit runs before it
 * goes anywhere.
 *
 * Where it goes:
 *  - always: one `[jarvis-question] {json}` line in the server logs (Vercel → Logs)
 *  - optionally: JARVIS_LOG_WEBHOOK — a Discord or Slack incoming webhook (gets a
 *    readable message), or any other URL (gets the JSON), e.g. a Google Apps
 *    Script that appends rows to a Sheet.
 */

export interface QuestionLog {
  question: string;
  page: string;
  brain: "ai" | "local";
  tools?: string[];
  firstWordMs?: number | null;
}

const LIMITS = {
  maxQuestionChars: 300,
  webhookTimeoutMs: 3000,
} as const;

const SCRUB: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]"],
  [/\+?\d[\d\s().-]{7,}\d/g, "[number]"],
];

export const scrubQuestion = (q: string) =>
  SCRUB.reduce((text, [re, label]) => text.replace(re, label), q.trim()).slice(0, LIMITS.maxQuestionChars);

const formatForChat = (entry: QuestionLog) => {
  const tools = entry.tools?.length ? ` · ${entry.tools.join(", ")}` : "";
  return `🤖 **${entry.page}** · ${entry.brain}${tools}\n> ${entry.question}`;
};

const webhookBody = (url: string, entry: QuestionLog & { at: string }) => {
  if (url.includes("discord.com/api/webhooks")) return { content: formatForChat(entry) };
  if (url.includes("hooks.slack.com")) return { text: formatForChat(entry).replace(/\*\*/g, "*") };
  return entry;
};

/** Fire-and-forget: logging must never slow down or break an answer. */
export async function logQuestion(raw: QuestionLog): Promise<void> {
  const entry = { ...raw, question: scrubQuestion(raw.question), at: new Date().toISOString() };
  if (!entry.question) return;
  console.info(`[jarvis-question] ${JSON.stringify(entry)}`);

  const url = process.env.JARVIS_LOG_WEBHOOK;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody(url, entry)),
      signal: AbortSignal.timeout(LIMITS.webhookTimeoutMs),
    });
  } catch (error: unknown) {
    console.error(`[jarvis-question] webhook failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}
