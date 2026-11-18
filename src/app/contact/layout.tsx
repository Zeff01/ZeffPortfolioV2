import type { Metadata } from "next";

// page.tsx is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Zeff Somera about a role or project — he's open to new work.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact · Zeff Somera", description: "Get in touch with Zeff Somera about a role or project — he's open to new work.", url: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
