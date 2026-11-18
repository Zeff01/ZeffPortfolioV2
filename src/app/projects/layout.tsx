import type { Metadata } from "next";

// page.tsx is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Projects",
  description: "Client and personal projects by Zeff Somera — AI platforms, blockchain rewards, mobile apps and internal tools.",
  alternates: { canonical: "/projects" },
  openGraph: { title: "Projects · Zeff Somera", description: "Client and personal projects by Zeff Somera — AI platforms, blockchain rewards, mobile apps and internal tools.", url: "/projects" },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
