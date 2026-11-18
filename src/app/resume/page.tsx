import type { Metadata } from "next";
import { buildResume, projectCandidates } from "@/lib/resume";
import { smartResume } from "@/lib/resumeAI";
import TailorResume from "./TailorResume";
import { RESUME_DOWNLOAD_PATH, RESUME_PDF_PATH, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${SITE.name} — ${SITE.role}. Always up to date with the latest projects and skills.`,
  alternates: { canonical: "/resume" },
};

/** Re-generate at most daily; the AI version only changes when the portfolio data does. */
export const revalidate = 86400;

const panel = "rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-7";
const sectionTitle = "mb-4 font-tech text-xs uppercase tracking-[0.3em] text-cyan-300";

/** HTML preview of the generated CV — the same data the PDF is rendered from. */
export default async function ResumePage() {
  const { resume: r, enhanced } = await smartResume(buildResume(), projectCandidates());

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 pb-24 pt-24 text-gray-300 sm:px-8">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-3 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
            Résumé{enhanced ? " · AI-written from live portfolio data" : ""}
          </span>
          <h1 className="font-tech text-3xl font-bold text-white sm:text-5xl">{r.name}</h1>
          <p className="mt-2 text-lg text-yellow-300">{r.headline}</p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
            <span>{r.location}</span>
            {r.contact.map((c) => (
              <a key={c.href} href={c.href} className="transition-colors hover:text-cyan-300">
                {c.label}
              </a>
            ))}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <a
            href={RESUME_DOWNLOAD_PATH}
            className="rounded-lg bg-yellow-300 px-5 py-2.5 font-bold text-black transition-colors hover:bg-yellow-400"
          >
            Download PDF
          </a>
          <a
            href={RESUME_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 px-5 py-2.5 text-white transition-colors hover:border-cyan-400/60"
          >
            View
          </a>
        </div>
      </header>

      <div className="space-y-6">
        <TailorResume />

        <section className={panel}>
          <h2 className={sectionTitle}>Profile</h2>
          <p className="leading-relaxed">{r.summary}</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {r.highlights.map((h) => (
              <li key={h} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center text-xs text-white">
                {h}
              </li>
            ))}
          </ul>
        </section>

        <section className={panel}>
          <h2 className={sectionTitle}>Experience</h2>
          <ol className="space-y-5">
            {r.roles.map((role) => (
              <li key={`${role.company}-${role.position}-${role.period}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-semibold text-white">
                    {role.position} <span className="text-cyan-300">· {role.company}</span>
                  </h3>
                  <span className="text-xs text-gray-500">{role.period}</span>
                </div>
                <p className="text-xs text-gray-500">{role.location}</p>
                {role.bullets?.length ? (
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed marker:text-cyan-400">
                    {role.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  role.summary && <p className="mt-1.5 text-sm leading-relaxed">{role.summary}</p>
                )}
              </li>
            ))}
          </ol>
          {r.earlierRoles.length > 0 && (
            <>
              <h3 className="mb-2 mt-6 text-sm font-semibold text-white">Earlier roles</h3>
              <ul className="space-y-1 text-sm">
                {r.earlierRoles.map((role) => (
                  <li
                    key={`${role.company}-${role.position}-${role.period}`}
                    className="flex flex-wrap justify-between gap-x-3"
                  >
                    <span>
                      {role.position} · <span className="text-gray-200">{role.company}</span>, {role.location}
                    </span>
                    <span className="text-xs text-gray-500">{role.period}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className={panel}>
          <h2 className={sectionTitle}>Selected projects</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {r.projects.map((p) => (
              <li key={p.title} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <span className="text-xs text-gray-500">{p.year}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed">{p.description}</p>
                {p.stack.length > 0 && <p className="mt-2 text-xs text-cyan-300/80">{p.stack.join(" · ")}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section className={panel}>
          <h2 className={sectionTitle}>Skills</h2>
          <dl className="space-y-2 text-sm">
            {r.skills.map((g) => (
              <div key={g.name} className="grid gap-1 sm:grid-cols-[120px_1fr]">
                <dt className="font-semibold text-white">{g.name}</dt>
                <dd>{g.skills.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={panel}>
          <h2 className={sectionTitle}>Education</h2>
          {r.education.map((e) => (
            <div key={e.school} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <div>
                <h3 className="font-semibold text-white">{e.school}</h3>
                <p className="text-sm">{e.degree}</p>
              </div>
              <span className="text-xs text-gray-500">{e.period}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
