import { experienceData } from "@/data/experienceData";
import { aboutStats } from "@/data/aboutStats";
import { PORTFOLIO_PROJECTS } from "./portfolio";

/**
 * The guided tour: each stop is a page, the element to spotlight
 * (`data-jarvis-tour="…"`) and the line Jarvis says there. Lines are fixed
 * text so their audio is cached after the first visitor hears them.
 */
export interface TourStep {
  path: string;
  target: string;
  line: string;
}

const statValue = (label: string) => {
  const s = aboutStats.find((x) => x.label === label);
  return s ? `${s.value}${s.suffix === "+" ? " plus" : ""}` : "";
};

const [latest, previous] = experienceData;
const workTitles = PORTFOLIO_PROJECTS.filter((p) => p.kind === "work")
  .slice(0, 3)
  .map((p) => p.title.split(/\s+[—-]\s+/)[0]);

const listify = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const TOUR_STEPS: TourStep[] = [
  {
    path: "/",
    target: "hero",
    line: "Right then, a quick tour. This is Zeff — an AI engineer and full-stack developer who also builds on the blockchain.",
  },
  {
    path: "/about",
    target: "stats",
    line: `First, the numbers: ${statValue("Satisfied Clients")} clients, ${statValue("Projects Completed")} projects shipped, and ${statValue("Interns Mentored")} interns mentored along the way.`,
  },
  {
    path: "/about",
    target: "skills",
    line: "His toolkit covers the whole stack — TypeScript and Next.js up front, Node and Supabase behind it, React Native for mobile, and Solidity on chain.",
  },
  {
    path: "/about",
    target: "experience",
    line: `The track record: ${experienceData.length} engagements for teams in the US, the UK, Australia and Asia — most recently ${latest.company}, and before that ${previous.company}.`,
  },
  {
    path: "/projects",
    target: "work-projects",
    line: `Now the work itself. These are client projects — ${listify(workTitles)} among them. Ask me about any of them later.`,
  },
  {
    path: "/projects",
    target: "own-projects",
    line: "And these he built for himself, simply because he wanted them to exist.",
  },
  {
    path: "/contact",
    target: "contact-form",
    line: "That's the tour. If you'd like to work with Zeff, this form goes straight to his inbox — or head back and ask me anything.",
  },
];
