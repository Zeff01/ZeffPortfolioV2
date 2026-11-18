import type { MetadataRoute } from "next";
import { SITE, SITE_URL } from "@/lib/site";

const PRIORITY: Record<string, number> = { "/": 1, "/projects": 0.9, "/about": 0.8, "/resume": 0.7, "/contact": 0.6 };
const DEFAULT_PRIORITY = 0.5;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return SITE.routes.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: PRIORITY[route] ?? DEFAULT_PRIORITY,
  }));
}
