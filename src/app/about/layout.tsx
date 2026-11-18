import type { Metadata } from "next";

// page.tsx is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "About",
  description: "Background, skills and 5+ years of experience of Zeff Somera — AI engineer, full-stack and blockchain developer.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About · Zeff Somera", description: "Background, skills and 5+ years of experience of Zeff Somera — AI engineer, full-stack and blockchain developer.", url: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
