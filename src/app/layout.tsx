import "./globals.css";
import { Inter } from "next/font/google";
import { Share_Tech } from "next/font/google";
import PortfolioWrapper from "@/components/PortfolioWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://zeff.vercel.app"),
  title: "Zeff Somera - Full Stack & Solidity Developer",
  description: "Portfolio of Zeff Somera, a passionate Full Stack and Solidity Developer specializing in modern web technologies and blockchain development.",
  keywords: ["Full Stack Developer", "Solidity Developer", "React", "Next.js", "Blockchain", "Web Development"],
  authors: [{ name: "Zeff Somera" }],
  creator: "Zeff Somera",
  openGraph: {
    title: "Zeff Somera - Full Stack & Solidity Developer",
    description: "Portfolio of Zeff Somera, a passionate Full Stack and Solidity Developer",
    url: "https://zeff.vercel.app",
    siteName: "Zeff Portfolio",
    images: [
      {
        url: "/ironmanassets/ironman-og.jpg",
        width: 1200,
        height: 630,
        alt: "Zeff Somera Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeff Somera - Full Stack & Solidity Developer",
    description: "Portfolio of Zeff Somera, a passionate Full Stack and Solidity Developer",
    images: ["/ironmanassets/ironman-og.jpg"],
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
      >
        <PortfolioWrapper>{children}</PortfolioWrapper>
      </body>
    </html>
  );
}
