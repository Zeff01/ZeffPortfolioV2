import { experienceData } from "@/data/experienceData";
import { projects, workProjects } from "@/data/projectsData";
import { skillsData, skillCategories } from "@/data/skillData";
import { JARVIS_THEMES } from "./theme";

/**
 * J.A.R.V.I.S.'s brain: a local intent matcher over the portfolio's own data.
 * No API key, no network — it answers from experienceData / projectsData /
 * skillData, and can drive the UI (navigate, theme, power save, voice).
 */

export const CONTACT = {
  email: "jzeffsomera@gmail.com",
  github: "https://github.com/Zeff01",
  linkedin: "https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/",
  resume: "/JzeffResume.pdf",
  yearsExperience: "5+",
} as const;

export type JarvisAction =
  | { type: "navigate"; href: string }
  | { type: "open"; href: string }
  | { type: "theme"; themeId: string }
  | { type: "powerSave"; on: boolean }
  | { type: "voice"; on: boolean }
  | { type: "clear" };

export interface JarvisReply {
  text: string;
  action?: JarvisAction;
}

interface Intent {
  test: (q: string) => boolean;
  reply: (q: string) => JarvisReply;
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ");

const MAX_LIST = 6;

const companies = experienceData.map((e) => ({ ...e, key: norm(e.company).trim() }));

const allProjects = [
  ...workProjects.map((p) => ({
    title: p.title,
    description: p.description,
    link: p.link,
    year: p.year,
  })),
  ...projects.map((p) => ({
    title: p.title,
    description: p.description,
    link: p.projectUrl,
    year: p.year,
  })),
].filter((p, i, arr) => arr.findIndex((o) => o.title === p.title) === i);

/** Title words too generic to identify a project on their own ("zeff" would hijack "who is zeff"). */
const GENERIC_TITLE_WORDS = new Set(["zeff", "pokemon", "stanton", "crypto"]);

/** Match on a project's distinctive first word, or its full title for generic ones. */
const matchesProject = (q: string, title: string) => {
  const t = norm(title).trim();
  const head = t.split(" ")[0];
  if (head.length <= 3 || GENERIC_TITLE_WORDS.has(head)) return q.includes(t);
  return q.includes(head);
};

const firstSentence = (s: string) => {
  const m = s.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : s).trim();
};

const skillsIn = (category: string) =>
  skillsData.filter((s) => s.category === category).map((s) => s.title);

const NAV_TARGETS: Record<string, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  work: "/projects",
  contact: "/contact",
};

export const HELP_TEXT = [
  "Here's what I can do, sir:",
  "• \"skills\" / \"frontend skills\" — the tech stack",
  "• \"experience\" or a company name (e.g. \"FixFlow\")",
  "• \"projects\" or a project name (e.g. \"Halrcall\")",
  "• \"contact\", \"resume\", \"github\"",
  "• \"open projects\" — navigate the site",
  `• \"theme <${JARVIS_THEMES.map((t) => t.id).join(" | ")}>\"`,
  "• \"power save on/off\", \"voice on/off\", \"clear\"",
].join("\n");

const INTENTS: Intent[] = [
  {
    test: (q) => /^(clear|cls|reset)\b/.test(q),
    reply: () => ({ text: "Console cleared.", action: { type: "clear" } }),
  },
  {
    test: (q) => has(q, "help", "command", "what can you"),
    reply: () => ({ text: HELP_TEXT }),
  },
  {
    test: (q) => has(q, "theme", "color", "colour"),
    reply: (q) => {
      const theme = JARVIS_THEMES.find(
        (t) => q.includes(t.id) || q.includes(t.name.toLowerCase())
      );
      if (!theme) {
        return {
          text: `Available armor finishes: ${JARVIS_THEMES.map((t) => `${t.id} (${t.name})`).join(", ")}.`,
        };
      }
      return {
        text: `Switching to the ${theme.name} finish.`,
        action: { type: "theme", themeId: theme.id },
      };
    },
  },
  {
    test: (q) => has(q, "power save", "powersave", "power saving"),
    reply: (q) => {
      const on = !has(q, "off", "disable");
      return {
        text: on
          ? "Power save engaged. Rendering throttled to 15 fps."
          : "Power save disengaged. Full 60 fps restored.",
        action: { type: "powerSave", on },
      };
    },
  },
  {
    test: (q) => /\b(voice|speak|mute|unmute|talk)\b/.test(q),
    reply: (q) => {
      const on = !has(q, "off", "mute", "disable", "stop") || q.includes("unmute");
      return {
        text: on ? "Voice output online." : "Voice output muted.",
        action: { type: "voice", on },
      };
    },
  },
  {
    test: (q) => /^(open|go to|goto|show|navigate|take me to)\b/.test(q) &&
      Object.keys(NAV_TARGETS).some((k) => q.includes(k)),
    reply: (q) => {
      const key = Object.keys(NAV_TARGETS).find((k) => q.includes(k)) ?? "home";
      return {
        text: `Routing you to ${key}.`,
        action: { type: "navigate", href: NAV_TARGETS[key] },
      };
    },
  },
  {
    test: (q) => /^(hi|hey|hello|yo|good (morning|afternoon|evening)|sup)\b/.test(q),
    reply: () => ({
      text: "Good day. I'm J.A.R.V.I.S., Zeff's portfolio assistant. Ask me about his skills, experience or projects — or type \"help\".",
    }),
  },
  {
    test: (q) => has(q, "resume", "cv", "curriculum"),
    reply: () => ({
      text: "Pulling up Zeff's résumé now.",
      action: { type: "open", href: CONTACT.resume },
    }),
  },
  {
    test: (q) => has(q, "github", "repo", "source code"),
    reply: () => ({
      text: `Zeff's GitHub: ${CONTACT.github}`,
      action: { type: "open", href: CONTACT.github },
    }),
  },
  {
    test: (q) => has(q, "linkedin"),
    reply: () => ({
      text: `LinkedIn profile: ${CONTACT.linkedin}`,
      action: { type: "open", href: CONTACT.linkedin },
    }),
  },
  {
    test: (q) => has(q, "contact", "email", "hire", "reach", "available", "freelance", "work with"),
    reply: () => ({
      text: `Zeff is open to new missions. Email ${CONTACT.email}, or use the contact page — I'll take you there.`,
      action: { type: "navigate", href: "/contact" },
    }),
  },
  {
    // A specific company
    test: (q) => companies.some((c) => c.key.length > 2 && q.includes(c.key)),
    reply: (q) => {
      const c = companies.find((co) => co.key.length > 2 && q.includes(co.key));
      if (!c) return { text: "" };
      return {
        text: `${c.position} @ ${c.company} (${c.time}, ${c.address}).\n${firstSentence(c.work)}`,
      };
    },
  },
  {
    // A specific project
    test: (q) => allProjects.some((p) => matchesProject(q, p.title)),
    reply: (q) => {
      const p = allProjects.find((pr) => matchesProject(q, pr.title));
      if (!p) return { text: "" };
      return {
        text: `${p.title} (${p.year}) — ${firstSentence(p.description)}${p.link ? `\nLive: ${p.link}` : ""}`,
      };
    },
  },
  {
    test: (q) => has(q, "skill", "stack", "tech", "language", "framework", "tools") ||
      skillCategories.some((c) => c.id !== "all" && q.includes(c.id)),
    reply: (q) => {
      const cat = skillCategories.find((c) => c.id !== "all" && q.includes(c.id));
      if (cat) {
        return { text: `${cat.name} systems: ${skillsIn(cat.id).join(", ")}.` };
      }
      const lines = skillCategories
        .filter((c) => c.id !== "all")
        .map((c) => ({ name: c.name, list: skillsIn(c.id) }))
        .filter((c) => c.list.length)
        .map((c) => `• ${c.name}: ${c.list.slice(0, MAX_LIST).join(", ")}`);
      return { text: `Armor loadout — ${skillsData.length} technologies:\n${lines.join("\n")}` };
    },
  },
  {
    test: (q) => has(q, "experience", "work history", "career", "companies", "jobs", "worked"),
    reply: () => {
      const recent = experienceData
        .slice(0, MAX_LIST)
        .map((e) => `• ${e.time} — ${e.position} @ ${e.company} (${e.address})`);
      return {
        text: `${CONTACT.yearsExperience} years in the field, ${experienceData.length} engagements logged. Most recent:\n${recent.join("\n")}`,
      };
    },
  },
  {
    test: (q) => has(q, "project", "portfolio", "built", "build", "made"),
    reply: () => {
      const list = allProjects
        .slice(0, MAX_LIST)
        .map((p) => `• ${p.title} (${p.year})`);
      return {
        text: `${allProjects.length} missions on file. Highlights:\n${list.join("\n")}\nAsk about any of them by name, or say "open projects".`,
      };
    },
  },
  {
    test: (q) => has(q, "blockchain", "web3", "solidity", "crypto", "nft"),
    reply: () => ({
      text: `Blockchain systems: ${skillsIn("blockchain").join(", ")}. Notable work: FixFlow — RepairCoin (AI + on-chain rewards), Pokemon NFT Staker, Cryptoverse.`,
    }),
  },
  {
    test: (q) => has(q, " ai ", "artificial", "llm", "openai", "agent"),
    reply: () => ({
      text: "AI engineering is a core discipline: Halrcall (autonomous AI marketing campaigns), FixFlow's AI shop tooling, and agent platforms like Agentsly.",
    }),
  },
  {
    test: (q) => has(q, "jarvis", "who are you", "what are you"),
    reply: () => ({
      text: "Just A Rather Very Intelligent System. I run locally in your browser and know everything in this portfolio.",
    }),
  },
  {
    test: (q) => has(q, "who", "about", "yourself", "zeff", "introduce"),
    reply: () => ({
      text: `Zeff Somera — AI Engineer, Full Stack and Blockchain Developer with ${CONTACT.yearsExperience} years of experience shipping for teams in the US, UK and Australia. Next.js, React Native, Supabase, Solidity — the full suit.`,
    }),
  },
];

export const askJarvis = (raw: string): JarvisReply => {
  const q = ` ${norm(raw).trim()} `.replace(/\s+/g, " ");
  const trimmed = q.trim();
  for (const intent of INTENTS) {
    if (intent.test(trimmed) || intent.test(q)) {
      const r = intent.reply(q);
      if (r.text) return r;
    }
  }
  return {
    text: "I'm afraid that's outside my database, sir. Try \"skills\", \"experience\", \"projects\" or \"help\".",
  };
};

export const QUICK_PROMPTS = ["Who is Zeff?", "Skills", "Experience", "Projects", "Hire Zeff"] as const;
