import { experienceData } from "@/data/experienceData";
import { projects, workProjects } from "@/data/projectsData";
import { skillsData, skillCategories } from "@/data/skillData";
import { JARVIS_THEMES } from "./theme";
import { CONTACT } from "./portfolio";

export { CONTACT };

/**
 * J.A.R.V.I.S.'s brain: a local intent matcher over the portfolio's own data.
 * No API key, no network — it answers from experienceData / projectsData /
 * skillData, and can drive the UI (navigate, theme, power save, voice).
 *
 * Every reply has two forms:
 *  - `text`   what appears in the chat (can hold detail and lists)
 *  - `speech` what Jarvis actually says — short and conversational, because
 *             nobody wants a list of 35 technologies read aloud.
 *
 * Replies are deterministic per question (variety comes from hashing the
 * question, not Math.random), so prefetched and cached voice lines still match.
 */


export type JarvisAction =
  | { type: "navigate"; href: string }
  | { type: "open"; href: string }
  | { type: "theme"; themeId: string }
  | { type: "powerSave"; on: boolean }
  | { type: "voice"; on: boolean }
  | { type: "tour" }
  | { type: "profileForm" }
  | { type: "clear" };

export interface JarvisReply {
  /** Shown in the chat bubble. */
  text: string;
  /** Spoken aloud; defaults to `text` when the two are the same. */
  speech?: string;
  action?: JarvisAction;
  /** Internal query to run when the visitor says "tell me more". */
  followUp?: string;
  /** Project to show as a holographic card. */
  card?: string;
  /** Show the tech arsenal (null category = all), with these skills already lit. */
  skills?: { category: string | null; lit?: string[] };
}

/** What Jarvis will say for a reply. */
export const speechOf = (reply: JarvisReply) => reply.speech ?? reply.text;

interface Intent {
  test: (q: string) => boolean;
  reply: (q: string) => JarvisReply;
}

const PAGE_SIZE = {
  experience: 4,
  projects: 4,
} as const;

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ");

/** Stable pick: the same question always gets the same phrasing. */
const pick = <T,>(seed: string, options: readonly T[]): T => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
};

/** "a, b and c" */
const listify = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const firstSentence = (s: string) => {
  const m = s.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : s).trim();
};

const COUNTRY_NAMES: Record<string, string> = {
  us: "the US",
  usa: "the US",
  "united kingdom": "the UK",
  uk: "the UK",
};

/** "Jackson, USA" → "the US"; "Makati, Philippines" → "the Philippines". */
const country = (address: string) => {
  const last = address.split(",").pop()?.trim() ?? address;
  const named = COUNTRY_NAMES[last.toLowerCase()];
  if (named) return named;
  return last === "Philippines" ? "the Philippines" : last;
};

/** "FullStack Developer | Mobile Developer" → "full-stack and mobile developer". */
const role = (position: string) => {
  const parts = position
    .split("|")
    .map((p) => p.trim().replace(/FullStack/i, "full-stack").replace(/\s*Developer$/i, ""));
  return `${listify(parts.map((p) => p.toLowerCase()))} developer`;
};

/** Text-list form: "the UK" → "UK". */
const countryLabel = (address: string) => country(address).replace(/^the /, "");

/** Turn a description fragment into a spoken clause: "AI marketing platform…" → "an AI marketing platform…". */
const asClause = (description: string) => {
  const s = firstSentence(description);
  const lowered = /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
  const article = /^[aeiou]/i.test(lowered) ? "an" : "a";
  return `It's ${article} ${lowered}`;
};

/** Too basic to lead with when Jarvis summarises a stack out loud. */
const UNREMARKABLE_SKILLS = new Set(["HTML", "CSS"]);

const companies = experienceData.map((e) => ({ ...e, key: norm(e.company).trim() }));

const allProjects = [
  ...workProjects.map((p) => ({ title: p.title, description: p.description, link: p.link, year: p.year })),
  ...projects.map((p) => ({ title: p.title, description: p.description, link: p.projectUrl, year: p.year })),
].filter((p, i, arr) => arr.findIndex((o) => o.title === p.title) === i);

/** "FixFlow — RepairCoin" → "FixFlow"; how a person would say it. */
const spokenTitle = (title: string) => title.split(/\s+[—-]\s+/)[0];

/** Title words too generic to identify a project on their own ("zeff" would hijack "who is zeff"). */
const GENERIC_TITLE_WORDS = new Set(["zeff", "pokemon", "stanton", "crypto"]);

/** Match on a project's distinctive first word, or its full title for generic ones. */
const matchesProject = (q: string, title: string) => {
  const t = norm(title).trim();
  const head = t.split(" ")[0];
  if (head.length <= 3 || GENERIC_TITLE_WORDS.has(head)) return q.includes(t);
  return q.includes(head);
};

const categories = skillCategories.filter((c) => c.id !== "all");

const skillsIn = (category: string) => skillsData.filter((s) => s.category === category).map((s) => s.title);

/** Skills by spoken name, longest first so "react native" wins over "react". */
const skillIndex = skillsData
  .map((s) => ({ ...s, key: ` ${norm(s.title).trim()} ` }))
  .sort((a, b) => b.key.length - a.key.length);

const findSkill = (q: string) => skillIndex.find((s) => q.includes(s.key));

const NAV_TARGETS: Record<string, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  work: "/projects",
  contact: "/contact",
};

export const HELP_TEXT = [
  "Here's what I can help with:",
  "• \"skills\", \"frontend skills\", or \"does he know Docker?\"",
  "• \"experience\" or a company name (e.g. \"FixFlow\")",
  "• \"projects\" or a project name (e.g. \"Halrcall\")",
  "• \"tell me more\" after any answer",
  "• \"contact\", \"resume\", \"github\"",
  "• \"open projects\" — I'll take you there",
  `• \"theme <${JARVIS_THEMES.map((t) => t.id).join(" | ")}>\"`,
  "• \"power save on/off\", \"voice on/off\", \"clear\"",
].join("\n");

const FOLLOW_UP = {
  skills: "skills overview more",
  experience: (page: number) => `experience page ${page}`,
  projects: (page: number) => `projects page ${page}`,
} as const;

const pageOf = (q: string) => Number(q.match(/page (\d+)/)?.[1] ?? 0);

const experienceReply = (page: number): JarvisReply => {
  const start = page * PAGE_SIZE.experience;
  const slice = experienceData.slice(start, start + PAGE_SIZE.experience);
  if (!slice.length) {
    return {
      text: "That's the whole record. Ask about any company by name and I'll tell you what he built there.",
    };
  }
  const lines = slice.map((e) => `• ${e.company} — ${role(e.position)}, ${countryLabel(e.address)} (${e.time})`);
  const more = start + slice.length < experienceData.length;
  const names = listify(slice.map((e) => e.company));
  if (page === 0) {
    const [latest] = slice;
    return {
      text: `${CONTACT.yearsExperience} years in, across ${experienceData.length} engagements. The most recent:\n${lines.join("\n")}${more ? "\n\nSay \"more\" for earlier roles." : ""}`,
      speech: `Over ${CONTACT.yearsExperience.replace("+", "")} years and ${experienceData.length} engagements. Most recently he was at ${latest.company} in ${country(latest.address)}, and before that ${listify(slice.slice(1).map((e) => e.company))}. The full list is on screen.`,
      followUp: more ? FOLLOW_UP.experience(page + 1) : undefined,
    };
  }
  return {
    text: `Earlier on:\n${lines.join("\n")}${more ? "\n\nThere's more if you want it." : ""}`,
    speech: `Going further back: ${names}.${more ? " There's more if you'd like." : ""}`,
    followUp: more ? FOLLOW_UP.experience(page + 1) : undefined,
  };
};

const projectsReply = (page: number): JarvisReply => {
  const start = page * PAGE_SIZE.projects;
  const slice = allProjects.slice(start, start + PAGE_SIZE.projects);
  if (!slice.length) {
    return {
      text: "That's everything I have on file. Say \"open projects\" to see them all with screenshots.",
      speech: "That's everything on file. Say open projects to see them with screenshots.",
    };
  }
  const lines = slice.map((p) => `• ${p.title} (${p.year}) — ${firstSentence(p.description)}`);
  const more = start + slice.length < allProjects.length;
  const names = listify(slice.map((p) => spokenTitle(p.title)));
  return {
    text: `${page === 0 ? `${allProjects.length} projects on file. A few highlights:` : "A few more:"}\n${lines.join("\n")}\n\nAsk about any by name, say "more", or "open projects".`,
    speech:
      page === 0
        ? `He's shipped ${allProjects.length} projects. Recent ones include ${names}. Want me to go into any of them?`
        : `There's also ${names}.`,
    followUp: more ? FOLLOW_UP.projects(page + 1) : undefined,
  };
};

const INTENTS: Intent[] = [
  {
    test: (q) => /^(clear|cls|reset)\b/.test(q),
    reply: () => ({ text: "Done — fresh slate.", action: { type: "clear" } }),
  },
  {
    test: (q) => has(q, "help", "command", "what can you", "what do you do"),
    reply: () => ({
      text: HELP_TEXT,
      speech: "Ask me about Zeff's skills, experience or projects, and I'll fill you in. I can also open pages, change my colours, or put you in touch.",
    }),
  },
  // ── Paging / follow-ups ────────────────────────────────────────────────────
  { test: (q) => q.startsWith("experience page"), reply: (q) => experienceReply(pageOf(q)) },
  { test: (q) => q.startsWith("projects page"), reply: (q) => projectsReply(pageOf(q)) },
  {
    test: (q) => q.startsWith("skills overview more"),
    reply: () => {
      const extras = categories
        .map((c) => ({ name: c.name, list: skillsIn(c.id).slice(6) }))
        .filter((c) => c.list.length)
        .map((c) => `• ${c.name}: ${c.list.join(", ")}`);
      return {
        text: extras.length
          ? `Beyond the headliners, he also works with:\n${extras.join("\n")}`
          : "That covers the full stack.",
        speech: extras.length
          ? "There's a bit more under the hood — I've put the rest of the list on screen."
          : "That covers the whole stack.",
      };
    },
  },
  // ── System controls ────────────────────────────────────────────────────────
  {
    test: (q) => has(q, "theme", "color", "colour"),
    reply: (q) => {
      const theme = JARVIS_THEMES.find((t) => q.includes(t.id) || q.includes(t.name.toLowerCase()));
      if (!theme) {
        return {
          text: `I come in a few finishes: ${JARVIS_THEMES.map((t) => `${t.id} (${t.name})`).join(", ")}. Just say "theme" and the name.`,
          speech: `I come in ${JARVIS_THEMES.length} finishes. Pick one from the list and I'll switch.`,
        };
      }
      return {
        text: pick(q, [`${theme.name} it is.`, `Switching to ${theme.name}. Good choice.`]),
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
          ? "Power save on — I'll keep the animations light."
          : "Power save off. Back to full performance.",
        action: { type: "powerSave", on },
      };
    },
  },
  {
    test: (q) => /\b(voice|speak|mute|unmute|talk)\b/.test(q),
    reply: (q) => {
      const on = !has(q, "off", "mute", "disable", "stop") || q.includes("unmute");
      return {
        text: on ? "I'm back on comms." : "Going quiet. I'll keep answering in text.",
        action: { type: "voice", on },
      };
    },
  },
  {
    test: (q) =>
      /^(open|go to|goto|show|navigate|take me to)\b/.test(q) && Object.keys(NAV_TARGETS).some((k) => q.includes(k)),
    reply: (q) => {
      const key = Object.keys(NAV_TARGETS).find((k) => q.includes(k)) ?? "home";
      return {
        text: pick(q, [`Taking you to ${key}.`, `On it — opening ${key}.`]),
        action: { type: "navigate", href: NAV_TARGETS[key] },
      };
    },
  },
  {
    test: (q) => has(q, "email me", "send me", "his profile", "mail me", "send his cv", "send his resume"),
    reply: () => ({
      text: "Happy to — pop your email in below and I'll send you a summary of Zeff's work with his résumé.",
      action: { type: "profileForm" },
    }),
  },
  {
    test: (q) => has(q, "tour", "show me around", "walkthrough", "guide me"),
    reply: () => ({
      text: "With pleasure — follow me.",
      action: { type: "tour" },
    }),
  },
  // ── Small talk ─────────────────────────────────────────────────────────────
  {
    test: (q) => /^(hi|hey|hello|yo|hiya|good (morning|afternoon|evening)|sup|what s up)\b/.test(q),
    reply: (q) => ({
      text: pick(q, [
        "Hello there. I'm J.A.R.V.I.S., Zeff's assistant. What would you like to know about him?",
        "Hey — good to have you here. Ask me anything about Zeff's work.",
        "Hi. I can walk you through Zeff's skills, projects or experience. Where shall we start?",
      ]),
    }),
  },
  {
    test: (q) => has(q, "how are you", "how s it going", "how r u", "you good"),
    reply: (q) => ({
      text: pick(q, [
        "All systems nominal, thank you for asking. What can I tell you about Zeff?",
        "Running beautifully. And you? Anything you'd like to know about Zeff's work?",
      ]),
    }),
  },
  {
    test: (q) => /^(thanks|thank you|thx|ty|cheers|appreciate)/.test(q),
    reply: (q) => ({
      text: pick(q, ["My pleasure.", "Anytime.", "Happy to help. Anything else?"]),
    }),
  },
  {
    test: (q) => /^(bye|goodbye|see you|later|cya)\b/.test(q),
    reply: () => ({
      text: "Take care. If you'd like to work with Zeff, the contact page is always open.",
    }),
  },
  {
    test: (q) => /^(cool|nice|awesome|great|wow|impressive|amazing|neat|sweet)\b/.test(q),
    reply: (q) => ({
      text: pick(q, [
        "I'll pass that on to Zeff. Want to see some of his projects?",
        "He'll be glad to hear it. Anything else you'd like to dig into?",
      ]),
    }),
  },
  // ── Links & contact ────────────────────────────────────────────────────────
  {
    test: (q) => has(q, "resume", "cv", "curriculum"),
    reply: () => ({
      text: "Here's Zeff's résumé — the button's just below.",
      action: { type: "open", href: CONTACT.resume },
    }),
  },
  {
    test: (q) => has(q, "github", "repo", "source code"),
    reply: () => ({
      text: "Here's his GitHub — the button's just below.",
      action: { type: "open", href: CONTACT.github },
    }),
  },
  {
    test: (q) => has(q, "linkedin"),
    reply: () => ({
      text: "Here's his LinkedIn — the button's just below.",
      action: { type: "open", href: CONTACT.linkedin },
    }),
  },
  // ── Specific things by name ────────────────────────────────────────────────
  {
    test: (q) => companies.some((c) => c.key.length > 2 && q.includes(c.key)),
    reply: (q) => {
      const c = companies.find((co) => co.key.length > 2 && q.includes(co.key));
      if (!c) return { text: "" };
      const summary = firstSentence(c.work).replace(/^As an? [^,]+, I /, "He ").replace(/\bI\b/g, "he");
      return {
        text: `${c.company} — ${role(c.position)}, ${countryLabel(c.address)} (${c.time}).\n${summary}`,
        speech: `At ${c.company}, he worked as a ${role(c.position)} for a team in ${country(c.address)}. ${summary}`,
      };
    },
  },
  {
    test: (q) => allProjects.some((p) => matchesProject(q, p.title)),
    reply: (q) => {
      const p = allProjects.find((pr) => matchesProject(q, pr.title));
      if (!p) return { text: "" };
      return {
        text: `${p.title} (${p.year}) — ${firstSentence(p.description)}${p.link ? `\nLive: ${p.link}` : ""}`,
        speech: `${spokenTitle(p.title)}, from ${p.year}. ${asClause(p.description)}${p.link ? " There's a live link on screen if you want to try it." : ""}`,
        card: p.title,
      };
    },
  },
  {
    // "Does he know Docker?" / "react"
    test: (q) => !!findSkill(q) && !has(q, "skills", "stack"),
    reply: (q) => {
      const s = findSkill(q);
      if (!s) return { text: "" };
      const raw = categories.find((c) => c.id === s.category)?.name ?? "";
      const cat = raw === "DevOps" ? raw : raw.toLowerCase();
      const peers = skillsIn(s.category).filter((t) => t !== s.title).slice(0, 3);
      return {
        skills: { category: s.category, lit: [s.title] },
        text: pick(q, [
          `Yes — ${s.title} is part of his ${cat} toolkit${peers.length ? `, alongside ${listify(peers)}` : ""}.`,
          `He does. ${s.title} sits in his ${cat} stack${peers.length ? ` with ${listify(peers)}` : ""}.`,
        ]),
      };
    },
  },
  {
    test: (q) => has(q, "blockchain", "web3", "solidity", "crypto", "nft"),
    reply: () => ({
      skills: { category: "blockchain" },
      text: `Blockchain is one of his specialties — ${listify(skillsIn("blockchain"))}. Notable work: FixFlow — RepairCoin (AI + on-chain rewards), Pokemon NFT Staker and Cryptoverse.`,
      speech: "Blockchain's one of his specialties. The big one is RepairCoin at FixFlow — on-chain rewards with AI built in — plus a Pokemon NFT staker and Cryptoverse.",
    }),
  },
  {
    test: (q) => has(q, " ai ", "artificial", "llm", "openai", "agent", "machine learning"),
    reply: () => ({
      text: "AI is at the core of his recent work: Halrcall (autonomous AI marketing campaigns), FixFlow's AI shop tooling, and agent platforms like Agentsly.",
      speech: "AI's at the heart of his recent work — Halrcall runs marketing campaigns on its own, and FixFlow puts AI tools in the hands of repair shops.",
    }),
  },
  {
    test: (q) =>
      has(q, "skill", "stack", "tech", "language", "framework", "tools", "what can he do") ||
      categories.some((c) => q.includes(c.id)),
    reply: (q) => {
      const cat = categories.find((c) => q.includes(c.id));
      if (cat) {
        const list = skillsIn(cat.id);
        const headline = list.filter((t) => !UNREMARKABLE_SKILLS.has(t)).slice(0, 4);
        return {
          skills: { category: cat.id },
          text: `${cat.name}: ${list.join(", ")}.`,
          speech: `On the ${cat.name === "DevOps" ? cat.name : cat.name.toLowerCase()} side, his go-tos are ${listify(headline)}${list.length > headline.length ? ", among others" : ""}.`,
        };
      }
      const lines = categories
        .map((c) => ({ name: c.name, list: skillsIn(c.id) }))
        .filter((c) => c.list.length)
        .map((c) => `• ${c.name}: ${c.list.slice(0, 6).join(", ")}`);
      return {
        text: `${skillsData.length} technologies across the stack:\n${lines.join("\n")}\n\nAsk about a specific one, like "does he know Docker?"`,
        speech:
          "He covers the whole stack. Mainly TypeScript, React and Next.js up front, Node and Supabase behind it, React Native for mobile, and Solidity for blockchain. The full list is on screen.",
        followUp: FOLLOW_UP.skills,
        skills: { category: null },
      };
    },
  },
  {
    test: (q) => has(q, "experience", "work history", "career", "companies", "jobs", "worked", "background"),
    reply: () => experienceReply(0),
  },
  {
    test: (q) => has(q, "project", "portfolio", "built", "build", "made", "work samples"),
    reply: () => projectsReply(0),
  },
  {
    test: (q) => has(q, "why hire", "why should", "what makes", "good at", "strength", "best at"),
    reply: () => ({
      text: `He ships end to end — web, mobile, AI and blockchain — and has done it for teams in the US, UK and Australia for ${CONTACT.yearsExperience} years. One person, the whole product.`,
      speech: "Because he ships the whole thing himself — web, mobile, AI and blockchain — and he's done it for teams across three continents. You get one person who can take an idea all the way to production.",
    }),
  },
  {
    test: (q) => has(q, "contact", "email", "hire", "reach", "available", "freelance", "work with", "rate", "price", "cost"),
    reply: () => ({
      text: `Zeff's open to new projects. Email ${CONTACT.email}, or use the contact page — I'll take you there now.`,
      speech: "He's open to new projects. I'll take you to the contact page — or drop him an email, it's on screen.",
      action: { type: "navigate", href: "/contact" },
    }),
  },
  {
    test: (q) => has(q, "jarvis", "who are you", "what are you", "are you real", "are you ai", "who made you", "who built you"),
    reply: () => ({
      text: "I'm J.A.R.V.I.S. — Just A Rather Very Intelligent System. Zeff built me to show visitors around. I run right here in your browser.",
      speech: "I'm Jarvis. Zeff built me to show visitors around — and yes, I run right here in your browser.",
    }),
  },
  {
    test: (q) => has(q, "who", "about", "yourself", "zeff", "introduce", "tell me"),
    reply: () => ({
      text: `Zeff Somera is an AI engineer and full-stack developer who also builds on the blockchain. ${CONTACT.yearsExperience} years shipping for teams in the US, UK and Australia — Next.js, React Native, Supabase, Solidity.`,
      speech: `Zeff's an AI engineer and full-stack developer who also builds on the blockchain. He's spent over ${CONTACT.yearsExperience.replace("+", "")} years shipping products for teams in the US, the UK and Australia.`,
      followUp: FOLLOW_UP.experience(0),
    }),
  },
];

const MORE = /^(more|tell me more|go on|continue|what else|and|keep going|next|anything else|yes|yeah|sure|ok|okay)$/;

const FALLBACKS = [
  "Hmm, that one's not in my files. I'm best on Zeff's skills, experience and projects — try one of those?",
  "I don't have an answer for that, I'm afraid. Ask me about his projects or experience and I'm all yours.",
  "That's outside what I know. I can tell you about Zeff's work, though — skills, projects, or where he's worked.",
] as const;

/**
 * Answer a visitor. `followUp` is the previous reply's follow-up query, used
 * when the visitor says "more" / "tell me more".
 */
export const askJarvis = (raw: string, followUp?: string): JarvisReply => {
  const q = ` ${norm(raw).trim()} `.replace(/\s+/g, " ");
  const trimmed = q.trim();

  if (MORE.test(trimmed)) {
    if (followUp) return askJarvis(followUp);
    return {
      text: "Happy to — what would you like more on? His skills, experience, or projects?",
    };
  }

  for (const intent of INTENTS) {
    if (intent.test(trimmed) || intent.test(q)) {
      const r = intent.reply(q);
      if (r.text) return r;
    }
  }
  return { text: pick(trimmed, FALLBACKS) };
};

export const QUICK_PROMPTS = ["Who is Zeff?", "Skills", "Projects", "Give me the tour", "Hire Zeff"] as const;
