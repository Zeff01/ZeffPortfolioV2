"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaGithub, FaStar } from "react-icons/fa";
import type { ContributionDay, GitHubActivity as Activity } from "@/lib/github";

const ENDPOINT = "/api/github";

/** Heatmap colours by GitHub level 0–4 (cyan, to match the HUD). */
const LEVEL_COLORS = ["bg-white/[0.06]", "bg-cyan-900", "bg-cyan-700", "bg-cyan-500", "bg-cyan-300"] as const;

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Solidity: "#AA6746",
  PHP: "#4F5D95",
  Ruby: "#701516",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
};
const DEFAULT_LANGUAGE_COLOR = "#8b949e";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""] as const;

const TIME = { minute: 60_000, hour: 3_600_000, day: 86_400_000, month: 2_592_000_000 } as const;

const timeAgo = (iso: string, now: number) => {
  const diff = Math.max(0, now - new Date(iso).getTime());
  if (diff < TIME.hour) return `${Math.max(1, Math.round(diff / TIME.minute))}m ago`;
  if (diff < TIME.day) return `${Math.round(diff / TIME.hour)}h ago`;
  if (diff < TIME.month) return `${Math.round(diff / TIME.day)}d ago`;
  return `${Math.round(diff / TIME.month)}mo ago`;
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const dayLabel = (d: ContributionDay) =>
  `${d.count === 0 ? "No" : d.count} contribution${d.count === 1 ? "" : "s"} on ${formatDate(d.date)}`;

/** Month label above the first week that starts in a new month. */
const monthLabels = (weeks: ContributionDay[][]) => {
  let last = -1;
  return weeks.map((w) => {
    const month = new Date(`${w[0].date}T00:00:00Z`).getUTCMonth();
    if (month === last) return "";
    last = month;
    return MONTHS[month];
  });
};

function Heatmap({ weeks, animate }: { weeks: ContributionDay[][]; animate: boolean }) {
  const labels = useMemo(() => monthLabels(weeks), [weeks]);
  const scroller = useRef<HTMLDivElement>(null);
  // On narrow screens the grid scrolls sideways — start at the most recent weeks.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks]);
  const firstWeekOffset = weeks[0] ? new Date(`${weeks[0][0].date}T00:00:00Z`).getUTCDay() : 0;
  // One CSS grid column per week: cells grow to fill the panel, and scroll sideways on phones.
  const columns = { gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` };

  return (
    <div ref={scroller} className="overflow-x-auto pb-2 [scrollbar-width:thin]">
      <div className="flex min-w-[680px] gap-2">
        <div className="grid grid-rows-7 gap-[3px] pt-5 text-[10px] leading-none text-gray-500" aria-hidden>
          {WEEKDAY_LABELS.map((d, i) => (
            <span key={i} className="flex items-center">
              {d}
            </span>
          ))}
        </div>
        <div className="flex-1">
          <div className="mb-1 grid h-4 gap-[3px] text-[10px] text-gray-500" style={columns} aria-hidden>
            {labels.map((m, i) => (
              <span key={i} className="overflow-visible whitespace-nowrap">
                {m}
              </span>
            ))}
          </div>
          <div className="grid gap-[3px]" style={columns}>
            {weeks.map((week, wi) => (
              <div key={week[0].date} className="grid grid-rows-7 gap-[3px]">
                {wi === 0 &&
                  Array.from({ length: firstWeekOffset }, (_, i) => (
                    <span key={`pad-${i}`} className="aspect-square" />
                  ))}
                {week.map((day) => (
                  <motion.span
                    key={day.date}
                    title={dayLabel(day)}
                    initial={animate ? { opacity: 0, scale: 0.4 } : false}
                    whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: wi * 0.012 }}
                    className={`aspect-square rounded-[2px] ${LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0]} ${
                      day.level >= 3 ? "shadow-[0_0_6px_rgba(34,211,238,0.6)]" : ""
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-cyan-400/20 bg-gradient-to-b from-cyan-400/10 to-transparent px-4 py-3">
      <span className="block font-tech text-2xl font-bold text-white">{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-gray-400">{label}</span>
    </div>
  );
}

/**
 * "Live from GitHub": the last year of contributions as a heatmap, streaks,
 * and the most recently pushed repos — proof the work is ongoing.
 */
export default function GitHubActivity() {
  const [data, setData] = useState<Activity | null>(null);
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();
    fetch(ENDPOINT, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Activity>) : Promise.reject(new Error(String(res.status)))))
      .then(setData)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  // Nothing to show is better than a broken widget.
  if (failed) return null;

  const now = data ? new Date(data.fetchedAt).getTime() : 0;
  const lastPush = data?.repos[0];
  const activeDays = data ? data.weeks.flat().filter((d) => d.count > 0).length : 0;

  return (
    <section
      aria-labelledby="github-activity-title"
      className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-8 md:px-12"
      data-jarvis-tour="github"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 font-tech text-xs uppercase tracking-[0.3em] text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              Live from GitHub
            </p>
            <h2 id="github-activity-title" className="font-tech text-2xl font-bold text-white sm:text-3xl">
              {data ? (
                <>
                  <span className="text-cyan-300">{data.total.toLocaleString("en-US")}</span> contributions in the last
                  year
                </>
              ) : (
                "Loading activity…"
              )}
            </h2>
          </div>
          <a
            href={data?.profileUrl ?? "https://github.com/Zeff01"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-cyan-400/60 focus-visible:border-cyan-400"
          >
            <FaGithub aria-hidden /> @{data?.user ?? "Zeff01"}
          </a>
        </div>

        {data ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={String(activeDays)} label="Active days" />
              <Stat value={`${data.currentStreak}d`} label="Current streak" />
              <Stat value={`${data.longestStreak}d`} label="Longest streak" />
              <Stat value={lastPush ? timeAgo(lastPush.pushedAt, now) : "—"} label="Last push" />
            </div>

            {data.weeks.length > 0 && (
              <figure className="mb-8">
                <figcaption className="sr-only">
                  Contribution heatmap: {data.total} contributions over the last year, longest streak{" "}
                  {data.longestStreak} days.
                </figcaption>
                <Heatmap weeks={data.weeks} animate={!reduceMotion} />
                <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-gray-500" aria-hidden>
                  Less
                  {LEVEL_COLORS.map((c) => (
                    <span key={c} className={`h-[10px] w-[10px] rounded-[2px] ${c}`} />
                  ))}
                  More
                </div>
              </figure>
            )}

            {data.repos.length > 0 && (
              <>
                <h3 className="mb-3 font-tech text-xs uppercase tracking-[0.3em] text-gray-400">Recently pushed</h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.repos.map((repo) => (
                    <li key={repo.name}>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full flex-col rounded-xl border border-white/10 border-l-2 border-l-cyan-400 bg-black/30 p-4 transition-colors hover:border-cyan-400/40 focus-visible:border-cyan-400"
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-semibold text-white">{repo.name}</span>
                          <span className="shrink-0 text-xs text-cyan-300">{timeAgo(repo.pushedAt, now)}</span>
                        </span>
                        <span className="mt-1 line-clamp-2 flex-1 text-sm text-gray-400">{repo.description}</span>
                        <span className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                          {repo.language && (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: LANGUAGE_COLORS[repo.language] ?? DEFAULT_LANGUAGE_COLOR }}
                              />
                              {repo.language}
                            </span>
                          )}
                          {repo.stars > 0 && (
                            <span className="flex items-center gap-1">
                              <FaStar aria-hidden className="text-yellow-300" /> {repo.stars}
                              <span className="sr-only">stars</span>
                            </span>
                          )}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <div className="h-40 animate-pulse rounded-xl bg-white/[0.04]" aria-hidden />
        )}
      </div>
    </section>
  );
}
