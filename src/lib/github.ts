/**
 * Live GitHub activity for the portfolio: the contributions calendar and the
 * most recently pushed public repos.
 *
 * Contributions come from the GraphQL API when GITHUB_TOKEN is set (includes
 * private-repo activity if the profile shows it), otherwise from the public
 * contributions calendar on github.com. Repos come from the public REST API.
 * Everything is cached (see GITHUB.revalidateSeconds) so the site makes a
 * handful of GitHub requests per hour at most.
 */

export const GITHUB = {
  user: "Zeff01",
  revalidateSeconds: 3600,
  recentRepos: 6,
  timeoutMs: 8000,
} as const;

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  /** 0 (none) – 4 (most), GitHub's own quartiles. */
  level: number;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
}

export interface GitHubActivity {
  user: string;
  profileUrl: string;
  total: number;
  /** Oldest first; weeks start on Sunday. */
  weeks: ContributionDay[][];
  repos: GitHubRepo[];
  currentStreak: number;
  longestStreak: number;
  fetchedAt: string;
}

const headers = (accept = "application/json"): HeadersInit => ({
  Accept: accept,
  "User-Agent": "portfolio-github-activity",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

const get = (url: string, init?: RequestInit) =>
  fetch(url, {
    ...init,
    signal: AbortSignal.timeout(GITHUB.timeoutMs),
    next: { revalidate: GITHUB.revalidateSeconds },
  });

// ── Contributions ──

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface GraphQLCalendar {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[];
        };
      };
    };
  };
}

async function contributionsViaGraphQL(): Promise<ContributionDay[] | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
    weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
  const res = await get("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: GITHUB.user } }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as GraphQLCalendar;
  const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks) return null;
  return weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVELS[d.contributionLevel] ?? 0,
    })),
  );
}

/** Parse github.com/users/<user>/contributions — cells carry the date and level; tooltips carry the count. */
async function contributionsViaPublicCalendar(): Promise<ContributionDay[] | null> {
  const res = await get(`https://github.com/users/${GITHUB.user}/contributions`, { headers: headers("text/html") });
  if (!res.ok) return null;
  const html = await res.text();

  const counts = new Map<string, number>();
  for (const m of Array.from(html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g))) {
    const n = m[2].match(/^([\d,]+) contributions?/);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }

  const days: ContributionDay[] = [];
  for (const m of Array.from(html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g))) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    if (!date) continue;
    days.push({ date, level, count: (id && counts.get(id)) || (level > 0 ? 1 : 0) });
  }
  return days.length ? days.sort((a, b) => a.date.localeCompare(b.date)) : null;
}

/** Group days into Sunday-first weeks, padding the first week so rows line up with weekdays. */
const toWeeks = (days: ContributionDay[]): ContributionDay[][] => {
  const weeks: ContributionDay[][] = [];
  for (const day of days) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    if (!weeks.length || weekday === 0) weeks.push([]);
    weeks[weeks.length - 1].push(day);
  }
  return weeks;
};

const streaks = (days: ContributionDay[]) => {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Today may not have activity yet — don't let that break the current streak.
  let current = 0;
  const lastIndex = days.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i !== lastIndex) break;
  }
  return { current, longest };
};

// ── Repos ──

interface RestRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

async function recentRepos(): Promise<GitHubRepo[]> {
  const res = await get(`https://api.github.com/users/${GITHUB.user}/repos?sort=pushed&per_page=20&type=owner`, {
    headers: headers("application/vnd.github+json"),
  });
  if (!res.ok) return [];
  const repos = (await res.json()) as RestRepo[];
  return repos
    .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== GITHUB.user.toLowerCase())
    .slice(0, GITHUB.recentRepos)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    }));
}

export async function getGitHubActivity(): Promise<GitHubActivity | null> {
  try {
    const [days, repos] = await Promise.all([
      contributionsViaGraphQL()
        .catch(() => null)
        .then((d) => d ?? contributionsViaPublicCalendar()),
      recentRepos().catch(() => []),
    ]);
    if (!days && !repos.length) return null;
    const list = days ?? [];
    const { current, longest } = streaks(list);
    return {
      user: GITHUB.user,
      profileUrl: `https://github.com/${GITHUB.user}`,
      total: list.reduce((sum, d) => sum + d.count, 0),
      weeks: toWeeks(list),
      repos,
      currentStreak: current,
      longestStreak: longest,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error(`[github] ${error instanceof Error ? error.message : "unknown error"}`);
    return null;
  }
}
