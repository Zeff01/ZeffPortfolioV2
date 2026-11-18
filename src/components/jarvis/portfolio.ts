import { experienceData } from "@/data/experienceData";
import { groupProjects, projects, workProjects } from "@/data/projectsData";
import { skillCategories, skillsData } from "@/data/skillData";
import { aboutStats } from "@/data/aboutStats";

/**
 * One normalised view of the portfolio, shared by:
 *  - the AI brain (server) — rendered into its knowledge base
 *  - the holographic project cards (client)
 *  - the local fallback brain
 */

export const CONTACT = {
  name: "Zeff Somera",
  email: "jzeffsomera@gmail.com",
  github: "https://github.com/Zeff01",
  linkedin: "https://www.linkedin.com/in/jzeffsomera",
  /** Generated from the portfolio data by /resume/pdf (the original CV stays at /JzeffResume.pdf). */
  resume: "/resume/pdf?download=1",
  yearsExperience: "5+",
  company: { name: "Codebility", url: "https://www.codebility.tech/services" },
} as const;

export type ProjectKind = "work" | "personal" | "group";

export interface PortfolioProject {
  title: string;
  year: number;
  role: string;
  kind: ProjectKind;
  description: string;
  details?: string;
  caseStudy?: { problem: string; approach: string; result: string };
  image?: string;
  tech: string[];
  link?: string;
}

const TECH_LABELS: Record<string, string> = {
  nextjs: "Next.js",
  react: "React",
  reactnative: "React Native",
  ts: "TypeScript",
  javascript: "JavaScript",
  openai: "OpenAI",
  solidity: "Solidity",
  tailwind: "Tailwind",
  node: "Node",
  supabase: "Supabase",
  stripe: "Stripe",
  firebase: "Firebase",
  mongo: "MongoDB",
  postgresSQL: "PostgreSQL",
  eth: "Ethereum",
  matic: "Polygon",
  solana: "Solana",
  ror: "Ruby on Rails",
  php: "PHP",
  aws: "AWS",
  docker: "Docker",
  vercel: "Vercel",
  github: "GitHub",
  express: "Express",
  materialui: "Material UI",
  shadcn: "shadcn/ui",
  sass: "Sass",
  wordpress: "WordPress",
  symfony: "Symfony",
  xendit: "Xendit",
  nginx: "Nginx",
  angular: "Angular",
  bootstrap: "Bootstrap",
  html: "HTML",
  css: "CSS",
};

/** Tech icons ship with each project; their file names double as the stack list. */
export const techIconLabel = (icon: string) => {
  const key = icon.split("/").pop()?.replace(/\.\w+$/, "") ?? icon;
  return TECH_LABELS[key] ?? key;
};

/** Strip template placeholders like "[Add your hard metric here…]" so nobody repeats them. */
const clean = (s?: string) => s?.replace(/\s*\[Add[^\]]*\]/g, "").trim() || undefined;

interface RawProject {
  title?: string;
  year?: number;
  role?: string;
  description?: string;
  fullDescription?: string;
  caseStudy?: { problem: string; approach: string; result: string };
  url?: string;
  imageUrl?: string;
  techIcons?: string[];
  link?: string;
  projectUrl?: string;
}

const normalise = (p: RawProject, kind: ProjectKind): PortfolioProject | null => {
  if (!p.title || !p.description) return null;
  return {
    title: p.title,
    year: p.year ?? 0,
    role: p.role ?? "Developer",
    kind,
    description: p.description.trim(),
    details: clean(p.fullDescription),
    caseStudy: p.caseStudy
      ? {
          problem: clean(p.caseStudy.problem) ?? "",
          approach: clean(p.caseStudy.approach) ?? "",
          result: clean(p.caseStudy.result) ?? "",
        }
      : undefined,
    image: p.url ?? p.imageUrl,
    tech: (p.techIcons ?? []).map(techIconLabel),
    link: (p.link ?? p.projectUrl) || undefined,
  };
};

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  ...(workProjects as RawProject[]).map((p) => normalise(p, "work")),
  ...(projects as RawProject[]).map((p) => normalise(p, "personal")),
  ...(groupProjects as RawProject[]).map((p) => normalise(p, "group")),
]
  .filter((p): p is PortfolioProject => p !== null)
  .filter((p, i, arr) => arr.findIndex((o) => o.title === p.title) === i);

export const PROJECT_TITLES = PORTFOLIO_PROJECTS.map((p) => p.title);

const looseKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Exact title first, then a forgiving match ("fixflow" → "FixFlow — RepairCoin"). */
export const findProject = (title: string): PortfolioProject | undefined => {
  const exact = PORTFOLIO_PROJECTS.find((p) => p.title === title);
  if (exact) return exact;
  const key = looseKey(title);
  if (!key) return undefined;
  return PORTFOLIO_PROJECTS.find((p) => {
    const t = looseKey(p.title);
    return t === key || t.startsWith(key) || key.startsWith(t);
  });
};

const skillsByCategory = () =>
  skillCategories
    .filter((c) => c.id !== "all")
    .map((c) => ({
      name: c.name,
      list: skillsData.filter((s) => s.category === c.id).map((s) => s.title),
    }))
    .filter((c) => c.list.length);

/**
 * Everything J.A.R.V.I.S. is allowed to know, as plain text. Deterministic —
 * built once per server process — so it sits in the prompt cache.
 */
export const buildKnowledgeBase = (): string => {
  const stats = aboutStats.map((s) => `${s.value}${s.suffix} ${s.label.toLowerCase()}`).join(", ");

  const experience = experienceData
    .map((e) => `### ${e.company} — ${e.position} (${e.time}, ${e.address})\n${e.work.trim()}`)
    .join("\n\n");

  const projectBlock = (p: PortfolioProject) => {
    const lines = [
      `### ${p.title} (${p.year}) — ${p.kind} project, role: ${p.role}`,
      p.details ?? p.description,
    ];
    if (p.caseStudy) {
      lines.push(
        `Problem: ${p.caseStudy.problem}`,
        `Approach: ${p.caseStudy.approach}`,
        `Result: ${p.caseStudy.result}`
      );
    }
    if (p.tech.length) lines.push(`Stack: ${p.tech.join(", ")}`);
    lines.push(p.link ? `Live: ${p.link}` : "Live link: none public");
    return lines.join("\n");
  };

  return [
    `# ${CONTACT.name}`,
    `AI Engineer, Full Stack and Blockchain Developer. ${CONTACT.yearsExperience} years of experience, shipping for teams in the US, UK and Australia (plus Korea, Thailand and the Philippines). Founder of ${CONTACT.company.name}, his tech company.`,
    `Headline numbers: ${stats}.`,
    `Contact: email ${CONTACT.email} · GitHub ${CONTACT.github} · LinkedIn on file · résumé downloadable on the site · contact form at /contact. Open to new projects.`,
    "",
    "## Skills",
    ...skillsByCategory().map((c) => `- ${c.name}: ${c.list.join(", ")}`),
    "",
    `## Experience (${experienceData.length} engagements, newest first)`,
    experience,
    "",
    `## Projects (${PORTFOLIO_PROJECTS.length})`,
    PORTFOLIO_PROJECTS.map(projectBlock).join("\n\n"),
  ].join("\n");
};

// ── Spotting projects in what Jarvis says ────────────────────────────────────

/** First words too generic to stand for a project on their own ("Iron Fence Shop" ≠ "iron"). */
const GENERIC_HEADS = new Set(["stanton", "iron", "pokemon", "codebility", "zeff", "crypto", "z"]);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every way a project can be said aloud, longest first so "Stanton Payroll" beats "Stanton". */
const PROJECT_ALIASES: { alias: RegExp; title: string; length: number }[] = PORTFOLIO_PROJECTS.flatMap((p) => {
  const names = new Set<string>([p.title]);
  p.title.split(/\s+[—-]\s+/).forEach((part) => names.add(part.trim()));
  const head = p.title.split(/[\s—-]+/)[0];
  if (head.length >= 4 && !GENERIC_HEADS.has(head.toLowerCase())) names.add(head);
  return Array.from(names).map((name) => ({
    alias: new RegExp(`(?<![\\w-])${escapeRe(name)}(?![\\w-])`, "gi"),
    title: p.title,
    length: name.length,
  }));
}).sort((a, b) => b.length - a.length);

export interface ProjectMention {
  title: string;
  /** Character offset in the text. */
  index: number;
}

/** Projects named in a piece of text, in the order they're said (each once, overlaps resolved). */
export const findMentions = (text: string): ProjectMention[] => {
  const taken: [number, number][] = [];
  const found: ProjectMention[] = [];
  for (const { alias, title, length } of PROJECT_ALIASES) {
    alias.lastIndex = 0;
    for (let m = alias.exec(text); m; m = alias.exec(text)) {
      const start = m.index;
      const end = start + length;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      taken.push([start, end]);
      found.push({ title, index: start });
    }
  }
  found.sort((a, b) => a.index - b.index);
  return found.filter((f, i) => found.findIndex((o) => o.title === f.title) === i);
};

// ── Skills: the "tech arsenal" hologram ──────────────────────────────────────

export interface SkillGroup {
  id: string;
  name: string;
  skills: { title: string; image: (typeof skillsData)[number]["image"] }[];
}

export const SKILL_GROUPS: SkillGroup[] = skillCategories
  .filter((c) => c.id !== "all")
  .map((c) => ({
    id: c.id,
    name: c.name,
    skills: skillsData.filter((s) => s.category === c.id).map((s) => ({ title: s.title, image: s.image })),
  }))
  .filter((g) => g.skills.length);

export const SKILL_CATEGORY_IDS = SKILL_GROUPS.map((g) => g.id);
export const SKILL_COUNT = skillsData.length;

/** Other ways a technology gets said. */
const SKILL_SYNONYMS: Record<string, string[]> = {
  Node: ["Node.js", "NodeJS"],
  PostgreSQL: ["Postgres"],
  Tailwind: ["Tailwind CSS", "TailwindCSS"],
  "Ruby on Rails": ["Rails"],
  "Next.js": ["NextJS", "Next JS"],
  "React Native": ["React-Native"],
  MongoDB: ["Mongo"],
  ShadCN: ["shadcn", "shadcn/ui"],
  "Material UI": ["MUI"],
  Ethereum: ["ETH"],
  AWS: ["Amazon Web Services"],
  GitHub: ["Github"],
  OpenAI: ["Open AI"],
};

/**
 * Skill names are proper nouns, so matching is case-sensitive: "React" lights
 * up, "react to" doesn't; "Express" yes, "express interest" no.
 */
const SKILL_ALIASES = skillsData
  .flatMap((s) =>
    [s.title, ...(SKILL_SYNONYMS[s.title] ?? [])].map((name) => ({
      re: new RegExp(`(?<![\\w-])${escapeRe(name)}(?![\\w-])`, "g"),
      title: s.title,
      length: name.length,
    }))
  )
  .sort((a, b) => b.length - a.length);

export interface SkillMention {
  title: string;
  index: number;
}

/** Technologies named in a piece of text, in spoken order (overlaps resolved: "React Native" ≠ "React"). */
export const findSkillMentions = (text: string): SkillMention[] => {
  const taken: [number, number][] = [];
  const found: SkillMention[] = [];
  for (const { re, title, length } of SKILL_ALIASES) {
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      const start = m.index;
      const end = start + length;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      taken.push([start, end]);
      found.push({ title, index: start });
    }
  }
  return found.sort((a, b) => a.index - b.index);
};

export const skillCategoryOf = (title: string) => skillsData.find((s) => s.title === title)?.category ?? null;
