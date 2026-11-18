/** Canonical site facts shared by metadata, the share image, sitemap and résumé. */

export const SITE_URL = "https://zeff.vercel.app";

export const SITE = {
  name: "Zeff Somera",
  title: "Zeff Somera — AI Engineer · Full Stack & Blockchain Developer",
  role: "AI Engineer · Full Stack & Blockchain Developer",
  description:
    "AI Engineer, Full Stack and Blockchain Developer with 5+ years shipping for teams in the US, UK and Australia — Next.js, React Native, Supabase, Solidity and AI. Talk to J.A.R.V.I.S., his voice assistant, to explore the work.",
  shortDescription:
    "5+ years shipping AI, web, mobile and blockchain products for teams in the US, UK and Australia.",
  stack: ["Next.js", "React Native", "Supabase", "Solidity", "AI"],
  keywords: [
    "AI Engineer",
    "Full Stack Developer",
    "Blockchain Developer",
    "Solidity Developer",
    "React Native Developer",
    "Next.js",
    "React",
    "Supabase",
    "TypeScript",
    "OpenAI",
    "Zeff Somera",
  ],
  /** Pages listed in the sitemap. */
  routes: ["/", "/about", "/projects", "/contact", "/resume"],
} as const;

export const RESUME_PDF_PATH = "/resume/pdf";
export const RESUME_DOWNLOAD_PATH = `${RESUME_PDF_PATH}?download=1`;
