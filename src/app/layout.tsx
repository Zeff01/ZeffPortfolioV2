import "./globals.css";
import { Inter } from "next/font/google";
import { Share_Tech } from "next/font/google";
import PortfolioWrapper from "@/components/PortfolioWrapper";
import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/ironmanlogo.jpg" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/ironmanlogo.jpg",
  },
  // The share image itself comes from app/opengraph-image.tsx (and twitter-image.tsx).
  openGraph: {
    title: SITE.title,
    description: SITE.shortDescription,
    url: SITE_URL,
    siteName: SITE.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const techFont = Share_Tech({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tech",
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${inter.className} ${techFont.variable} overflow-x-hidden w-full flex flex-col min-h-screen bg-blackBackground`}
        suppressHydrationWarning
      >
        <PortfolioWrapper>{children}</PortfolioWrapper>
      </body>
    </html>
  );
}
