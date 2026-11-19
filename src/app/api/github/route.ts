import { getGitHubActivity, GITHUB } from "@/lib/github";

/** GET /api/github — contributions calendar + recently pushed repos, cached for an hour. */
export const revalidate = 3600;

export async function GET() {
  const activity = await getGitHubActivity();
  if (!activity) return Response.json({ error: "GitHub is unavailable right now." }, { status: 503 });
  return Response.json(activity, {
    headers: {
      "Cache-Control": `public, max-age=0, s-maxage=${GITHUB.revalidateSeconds}, stale-while-revalidate=86400`,
    },
  });
}
