import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createHash } from "node:crypto";
import type { ResumeData, ResumeProject } from "./resume";

/**
 * The AI layer of the résumé generator.
 *
 * Claude turns the raw portfolio data into a sharper CV — a recruiter-grade
 * summary, achievement-style bullets per role, the strongest projects picked
 * and phrased in one line, and a "Core" skills line. It's always written
 * from Zeff's own experience and skills — never re-angled toward a job post.
 *
 * It only rephrases and re-orders facts that are already in the data: every
 * output is validated against the source (companies, project titles and
 * skills must exist), and anything that doesn't check out falls back to the
 * plain data-built version. No API key → the plain version, unchanged.
 */

const CONFIG = {
  model: process.env.RESUME_MODEL || process.env.JARVIS_MODEL || "claude-opus-5-5",
  maxTokens: 8000,
  bulletsPerRole: { min: 2, max: 3 },
  bulletMaxChars: 190,
  projectLineMaxChars: 170,
  summaryMaxChars: 520,
  headlineMaxChars: 90,
  coreSkills: { min: 6, max: 12 },
} as const;

const Enhancement = z.object({
  headline: z.string().describe("Professional headline, e.g. 'AI Engineer · Full Stack & Blockchain Developer'"),
  summary: z.string().describe("3–4 sentence professional summary, no first person, no clichés"),
  roles: z
    .array(
      z.object({
        company: z.string().describe("Exactly as given"),
        bullets: z.array(z.string()).describe("2–3 achievement bullets, past tense, starting with a strong verb"),
      })
    )
    .describe("One entry per detailed role, same order as given"),
  projects: z
    .array(z.object({ title: z.string().describe("Exactly as given"), line: z.string() }))
    .describe("The most relevant projects, best first"),
  coreSkills: z.array(z.string()).describe("Skills to lead with, exactly as named in the skills list"),
});

type EnhancementT = z.infer<typeof Enhancement>;

export interface SmartResume {
  resume: ResumeData;
  /** True when the AI version was used (false = plain data-built résumé). */
  enhanced: boolean;
}

const SYSTEM = `You are an expert technical recruiter and résumé writer. You rewrite a software engineer's résumé from the structured data you're given.

Hard rules:
- Use ONLY facts present in the data. Never invent metrics, numbers, employers, clients, dates, titles, technologies or outcomes. If the data has no number, don't add one.
- You may rephrase, condense, combine and re-order. Prefer concrete nouns from the data (product names, stacks, platforms) over adjectives.
- Bullets: past tense, start with a strong verb (Built, Shipped, Led, Integrated, Designed…), one line each (under ${CONFIG.bulletMaxChars} characters), no trailing period.
- Summary: 3–4 crisp sentences, third-person-implied (no "I", no name), no clichés like "passionate", "dynamic", "results-driven".
- Company names and project titles must be copied exactly as given. Core skills must be chosen from the provided skills list, named exactly.
- Plain text only — no markdown, no emoji.`;

const promptFor = (data: ResumeData, candidates: ResumeProject[]) => {
  const roles = data.roles
    .map((r) => `- ${r.company} | ${r.position} | ${r.period} | ${r.location}\n  ${r.summary ?? ""}`)
    .join("\n");
  const projects = candidates
    .map((p) => `- ${p.title} (${p.year}) | ${p.role} | ${p.stack.join(", ")}\n  ${p.description}`)
    .join("\n");
  const skills = data.skills.map((g) => `- ${g.name}: ${g.skills.join(", ")}`).join("\n");
  return `Write the strongest version of this résumé, built around his own experience and skills, for senior full-stack / AI engineering roles.

Return:
- headline (max ${CONFIG.headlineMaxChars} chars)
- summary (max ${CONFIG.summaryMaxChars} chars)
- roles: for each detailed role below, ${CONFIG.bulletsPerRole.min}–${CONFIG.bulletsPerRole.max} bullets
- projects: the 6 most relevant from the candidates, each with a one-line description (max ${CONFIG.projectLineMaxChars} chars)
- coreSkills: ${CONFIG.coreSkills.min}–${CONFIG.coreSkills.max} skills to lead with

<current_summary>
${data.summary}
</current_summary>

<headline_numbers>
${data.highlights.join(", ")}
</headline_numbers>

<detailed_roles>
${roles}
</detailed_roles>

<project_candidates>
${projects}
</project_candidates>

<skills>
${skills}
</skills>`;
};

const trimTo = (s: string, max: number) => {
  const t = s.replace(/\s+/g, " ").trim().replace(/^[-•*]\s*/, "");
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

/** Merge the AI output into the résumé, keeping only what checks out against the source data. */
const merge = (base: ResumeData, candidates: ResumeProject[], ai: EnhancementT): ResumeData => {
  const byCompany = new Map(ai.roles.map((r) => [r.company.trim().toLowerCase(), r.bullets]));
  const roles = base.roles.map((role) => {
    const bullets = (byCompany.get(role.company.toLowerCase()) ?? [])
      .map((b) => trimTo(b, CONFIG.bulletMaxChars).replace(/\.$/, ""))
      .filter(Boolean)
      .slice(0, CONFIG.bulletsPerRole.max);
    return bullets.length >= CONFIG.bulletsPerRole.min ? { ...role, bullets } : role;
  });

  const byTitle = new Map(candidates.map((p) => [p.title.toLowerCase(), p]));
  const picked = ai.projects
    .map((p) => {
      const source = byTitle.get(p.title.trim().toLowerCase());
      return source ? { ...source, description: trimTo(p.line, CONFIG.projectLineMaxChars) || source.description } : null;
    })
    .filter((p): p is ResumeProject => p !== null)
    .filter((p, i, arr) => arr.findIndex((o) => o.title === p.title) === i);
  const projects = picked.length >= base.projects.length / 2 ? picked.slice(0, base.projects.length) : base.projects;

  const allSkills = new Map(base.skills.flatMap((g) => g.skills).map((s) => [s.toLowerCase(), s]));
  const core = ai.coreSkills
    .map((s) => allSkills.get(s.trim().toLowerCase()))
    .filter((s): s is string => !!s)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, CONFIG.coreSkills.max);
  const skills = core.length >= CONFIG.coreSkills.min ? [{ name: "Core", skills: core }, ...base.skills] : base.skills;

  const summary = trimTo(ai.summary, CONFIG.summaryMaxChars);

  return {
    ...base,
    // Zeff's own brand title always stays.
    headline: base.headline,
    summary: summary.length > 80 ? summary : base.summary,
    roles,
    projects,
    skills,
  };
};

let client: Anthropic | null = null;
const hasCredentials = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

/** Cache by content: the general version only changes when the portfolio data does. */
const cache = new Map<string, Promise<SmartResume>>();
const keyFor = (base: ResumeData) =>
  createHash("sha256").update(JSON.stringify({ base, model: CONFIG.model })).digest("hex");

async function generate(base: ResumeData, candidates: ResumeProject[]): Promise<SmartResume> {
  if (!hasCredentials()) return { resume: base, enhanced: false };
  client ??= new Anthropic();
  try {
    const response = await client.messages.parse({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: promptFor(base, candidates) }],
      output_config: { format: zodOutputFormat(Enhancement) },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return { resume: base, enhanced: false };
    return { resume: merge(base, candidates, response.parsed_output), enhanced: true };
  } catch (error: unknown) {
    const message = error instanceof Anthropic.APIError ? `API error ${error.status}` : error instanceof Error ? error.message : "unknown";
    console.error(`[resume-ai] ${message} — serving the plain résumé`);
    return { resume: base, enhanced: false };
  }
}

/** The AI-written résumé (or the plain one when AI isn't available). */
export function smartResume(base: ResumeData, candidates: ResumeProject[]): Promise<SmartResume> {
  const key = keyFor(base);
  const hit = cache.get(key);
  if (hit) return hit;

  const pending = generate(base, candidates).then((result) => {
    if (!result.enhanced) cache.delete(key); // retry next time rather than caching a failure
    return result;
  });
  cache.set(key, pending);
  return pending;
}

/**
 * Like `smartResume`, but never makes a visitor wait longer than `ms`: if the
 * AI version isn't ready, serve the plain one now and let the AI version finish
 * in the background (it's cached for the next request).
 */
export async function smartResumeWithin(
  base: ResumeData,
  candidates: ResumeProject[],
  ms: number
): Promise<SmartResume> {
  const pending = smartResume(base, candidates);
  const timeout = new Promise<SmartResume>((resolve) =>
    setTimeout(() => resolve({ resume: base, enhanced: false }), ms)
  );
  return Promise.race([pending, timeout]);
}
