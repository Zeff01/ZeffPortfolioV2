import { experienceData } from "@/data/experienceData";
import { aboutStats } from "@/data/aboutStats";
import { resumeProfile } from "@/data/resumeProfile";
import { PORTFOLIO_PROJECTS, SKILL_GROUPS } from "@/components/jarvis/portfolio";

/**
 * One résumé, built from the portfolio's own data. Both the PDF route and the
 * /resume preview page render this, so adding a job, project or skill to
 * src/data updates the downloadable CV automatically.
 */

export interface ResumeRole {
  position: string;
  company: string;
  location: string;
  period: string;
  /** Present for the newest roles only; older ones are listed on one line. */
  summary?: string;
  /** Achievement bullets written by the AI layer (replace `summary` when present). */
  bullets?: string[];
}

export interface ResumeProject {
  title: string;
  year: number;
  role: string;
  description: string;
  stack: string[];
  link?: string;
}

export interface ResumeSkillGroup {
  name: string;
  skills: string[];
}

export interface ResumeLink {
  label: string;
  href: string;
}

export interface ResumeData {
  name: string;
  headline: string;
  location: string;
  contact: ResumeLink[];
  summary: string;
  highlights: string[];
  roles: ResumeRole[];
  earlierRoles: ResumeRole[];
  projects: ResumeProject[];
  skills: ResumeSkillGroup[];
  education: { school: string; degree: string; period: string }[];
}

const LIMITS = {
  summarySentences: 2,
  summaryMaxChars: 330,
  projectMaxChars: 170,
} as const;

/** Drop template notes like "[Add your hard metric here…]". */
const clean = (text: string) => text.replace(/\s*\[Add[^\]]*\]/g, "").replace(/\s+/g, " ").trim();

const sentences = (text: string, count: number, maxChars: number) => {
  // A sentence ends at . ! ? followed by a capital (or the end) — so "Next.js" and "React.js" stay whole.
  const parts = clean(text).match(/[\s\S]*?[.!?](?=\s+[A-Z(]|\s*$)/g) ?? [clean(text)];
  let out = "";
  for (const part of parts.slice(0, count)) {
    const next = `${out} ${part.trim()}`.trim();
    if (out && next.length > maxChars) break;
    out = next;
  }
  return out.length > maxChars ? `${out.slice(0, maxChars - 1).trimEnd()}…` : out;
};

/** "FullStack Developer | Mobile Developer" → "Full Stack Developer / Mobile Developer". */
const tidyPosition = (position: string) =>
  position.replace(/FullStack/gi, "Full Stack").replace(/\s*\|\s*/g, " / ").trim();

const prettyUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const RESUME_FILENAME = "Zeff-Somera-Resume.pdf";

const toResumeProject = (proj: (typeof PORTFOLIO_PROJECTS)[number]): ResumeProject => ({
  title: proj.title,
  year: proj.year,
  role: proj.role,
  description: sentences(proj.description, 1, LIMITS.projectMaxChars),
  stack: proj.tech,
  link: proj.link,
});

/**
 * Every project the AI may feature: client work first, then personal and team
 * builds — so a tailored CV can surface e.g. an AI side project for an AI role.
 */
export const projectCandidates = (): ResumeProject[] =>
  [...PORTFOLIO_PROJECTS.filter((p) => p.kind === "work"), ...PORTFOLIO_PROJECTS.filter((p) => p.kind !== "work")].map(
    toResumeProject
  );

export function buildResume(): ResumeData {
  const p = resumeProfile;

  const roles: ResumeRole[] = experienceData.map((e) => ({
    position: tidyPosition(e.position),
    company: e.company.trim(),
    location: e.address.trim(),
    period: e.time.replace(/\s*-\s*/g, " – ").replace(/PRESENT/i, "Present"),
    summary: sentences(e.work, LIMITS.summarySentences, LIMITS.summaryMaxChars),
  }));

  const projects: ResumeProject[] = PORTFOLIO_PROJECTS.filter((proj) => proj.kind === "work")
    .slice(0, p.featuredProjects)
    .map(toResumeProject);

  const known = new Set(SKILL_GROUPS.flatMap((g) => g.skills.map((s) => s.title.toLowerCase())));
  const extra = p.additionalSkills.filter((s) => !known.has(s.toLowerCase()));
  const skills: ResumeSkillGroup[] = [
    ...SKILL_GROUPS.map((g) => ({ name: g.name, skills: g.skills.map((s) => s.title) })),
    ...(extra.length ? [{ name: "Also", skills: extra }] : []),
  ];

  const contact: ResumeLink[] = [
    { label: p.email, href: `mailto:${p.email}` },
    ...(p.phone ? [{ label: p.phone, href: `tel:${p.phone.replace(/\s+/g, "")}` }] : []),
    { label: prettyUrl(p.website), href: p.website },
    { label: prettyUrl(p.linkedin), href: p.linkedin },
    { label: prettyUrl(p.github), href: p.github },
  ];

  return {
    name: p.displayName,
    headline: p.headline,
    location: p.location,
    contact,
    summary: clean(p.summary),
    highlights: aboutStats.map((s) => `${s.value}${s.suffix} ${s.label}`),
    roles: roles.slice(0, p.detailedRoles),
    earlierRoles: roles
      .slice(p.detailedRoles)
      .map((r) => ({ position: r.position, company: r.company, location: r.location, period: r.period })),
    projects,
    skills,
    education: p.education,
  };
}
