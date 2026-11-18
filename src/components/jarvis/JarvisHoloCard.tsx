"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HiArrowTopRightOnSquare, HiXMark } from "react-icons/hi2";
import { useJarvis } from "./JarvisProvider";
import { SKILL_COUNT, SKILL_GROUPS, type PortfolioProject } from "./portfolio";

interface JarvisHoloCardProps {
  className?: string;
}

const KIND_LABEL = {
  work: "CLIENT WORK",
  personal: "PERSONAL BUILD",
  group: "TEAM PROJECT",
} as const;

const MAX_TECH = 7;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * What J.A.R.V.I.S. is talking about, projected front and centre over the
 * hero: a project card (swapping as he names each one) or his tech arsenal
 * (each skill lighting up as he says it).
 */
export default function JarvisHoloCard({ className }: JarvisHoloCardProps) {
  const { card, hideCard } = useJarvis();
  const reduceMotion = useReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 z-40 ${className ?? ""}`}>
      {/* Dim the hero around the card so it reads as the focus. */}
      <AnimatePresence>
        {card && (
          <motion.div
            key="holo-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_32%,rgba(0,0,0,0.6),transparent_75%)]"
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-x-3 top-3 flex justify-center md:inset-x-6 md:top-[8vh]">
        <AnimatePresence mode="wait">
          {card && (
            <motion.aside
              key={card.kind === "project" ? card.project.title : `skills-${card.category ?? "all"}`}
              aria-label={card.kind === "project" ? `Project: ${card.project.title}` : "Tech arsenal"}
              aria-live="polite"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleY: 0.04, filter: "brightness(3)" }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 1, 0.55, 1], scaleY: 1, filter: "brightness(1)" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleY: 0.04, filter: "brightness(2.5)" }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ transformOrigin: "50% 50%" }}
              className={`jv-panel jv-holo pointer-events-auto w-full max-w-[420px] md:max-w-none ${
                card.kind === "skills" && !card.category ? "md:w-[min(920px,100%)]" : "md:w-[min(760px,100%)]"
              }`}
            >
              <header className="flex items-center justify-between gap-2 border-b border-[color:var(--jv-line)] px-3 py-1.5 text-[10px] tracking-[0.25em] md:px-5 md:py-2.5 md:text-xs">
                <span className="jv-accent truncate">
                  HOLO // {card.kind === "project" ? KIND_LABEL[card.project.kind] : "TECH ARSENAL"}
                </span>
                <button
                  type="button"
                  onClick={hideCard}
                  aria-label="Close project card"
                  className="jv-dim text-base transition-opacity hover:opacity-70 md:text-lg"
                >
                  <HiXMark />
                </button>
              </header>

              {card.kind === "project" ? (
                <ProjectBody project={card.project} />
              ) : (
                <SkillsBody category={card.category} lit={card.lit} />
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProjectBody({ project }: { project: PortfolioProject }) {
  return (
    <div className="grid gap-3 p-3 md:grid-cols-[1.3fr_1fr] md:gap-5 md:p-5">
      {project.image && (
        <div className="jv-holo-media relative aspect-[16/9] w-full bg-black/40 md:aspect-auto md:min-h-[260px]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 90vw, 440px"
            className="object-cover object-top"
          />
          <span className="jv-holo-sweep" />
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-2 md:gap-3">
        <div>
          <h3 className="jv-glow-text font-tech text-lg font-bold leading-tight md:text-3xl">{project.title}</h3>
          <p className="jv-dim mt-1 text-[10px] tracking-widest md:text-xs">
            {project.year > 0 ? `${project.year} · ` : ""}
            {project.role.toUpperCase()}
          </p>
        </div>

        <p className="line-clamp-3 text-xs leading-relaxed md:line-clamp-5 md:text-[15px]">{project.description}</p>

        {project.tech.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
            {project.tech.slice(0, MAX_TECH).map((t) => (
              <li key={t} className="jv-chip px-1.5 py-0.5 text-[9px] tracking-wider md:px-2 md:text-xs">
                {t}
              </li>
            ))}
          </ul>
        )}

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="jv-chip jv-accent mt-auto inline-flex w-fit items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest md:text-xs"
          >
            OPEN LIVE <HiArrowTopRightOnSquare />
          </a>
        )}
      </div>
    </div>
  );
}

interface SkillsBodyProps {
  category: string | null;
  lit: string[];
}

/**
 * The tech arsenal: real skill icons grouped by category. Skills Jarvis has
 * named glow; once anything is lit, the rest step back so the eye follows him.
 */
function SkillsBody({ category, lit }: SkillsBodyProps) {
  const groups = category ? SKILL_GROUPS.filter((g) => g.id === category) : SKILL_GROUPS;
  const onScreen = lit.filter((t) => groups.some((g) => g.skills.some((s) => s.title === t)));
  const focused = onScreen.length > 0;
  const big = !!category;
  const latest = onScreen[onScreen.length - 1];

  return (
    <div className="max-h-[60vh] overflow-y-auto p-3 jv-scroll md:max-h-none md:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 md:mb-4">
        <h3 className="jv-glow-text font-tech text-lg font-bold leading-tight md:text-3xl">
          {category ? `${groups[0]?.name ?? "Tech"} arsenal` : "Tech arsenal"}
        </h3>
        <p className="jv-dim text-[10px] tracking-widest md:text-xs">
          {latest ? (
            <>
              NOW: <span className="jv-accent">{latest.toUpperCase()}</span>
            </>
          ) : (
            `${category ? groups[0]?.skills.length ?? 0 : SKILL_COUNT} TECHNOLOGIES`
          )}
        </p>
      </div>

      <div className={big ? "" : "space-y-1.5 md:space-y-2"}>
        {groups.map((g, gi) => (
          <div key={g.id} className={big ? "" : "flex flex-col gap-1 md:flex-row md:items-center md:gap-3"}>
            {!big && (
              <span className="jv-dim w-24 shrink-0 text-[9px] tracking-[0.25em] md:text-[10px]">{g.name.toUpperCase()}</span>
            )}
            <ul className={`flex flex-wrap ${big ? "gap-2 md:gap-3" : "gap-1 md:gap-1.5"}`}>
              {g.skills.map((skill, si) => {
                const on = onScreen.includes(skill.title);
                return (
                  <motion.li
                    key={skill.title}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: focused && !on ? 0.35 : 1, y: 0, scale: on ? 1.08 : 1 }}
                    transition={{ duration: 0.3, delay: focused ? 0 : (gi * 4 + si) * 0.015 }}
                    title={skill.title}
                    className={`jv-chip flex flex-col items-center justify-center gap-1 text-center ${
                      big ? "w-[76px] p-2 md:w-[92px] md:p-2.5" : "w-[52px] p-1 md:w-[60px] md:p-1.5"
                    } ${on ? "jv-skill-lit" : ""}`}
                  >
                    <Image
                      src={skill.image}
                      alt=""
                      className={`object-contain ${big ? "h-9 w-9 md:h-11 md:w-11" : "h-5 w-5 md:h-6 md:w-6"}`}
                    />
                    <span className={`w-full truncate leading-tight ${big ? "text-[10px] md:text-xs" : "text-[8px] md:text-[9px]"}`}>
                      {skill.title}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
