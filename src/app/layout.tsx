"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { Share_Tech } from "next/font/google";
import Footer from "@/components/Footer";
import SmallArcReactor from "@/components/SmallArcReactor";
import SimplifiedPortfolio from "./SimplifiedPortfolio";

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
  const [showSimplifiedPortfolio, setShowSimplifiedPortfolio] = useState(true);

  const handleTogglePortfolio = () => {
    setShowSimplifiedPortfolio(!showSimplifiedPortfolio);
  };

  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${inter.className} ${techFont.variable} overflow-x-hidden w-full flex flex-col min-h-screen bg-blackBackground`}
      >
        {showSimplifiedPortfolio ? (
          <AnimatePresence>
            <SimplifiedPortfolio onClose={handleTogglePortfolio} />
          </AnimatePresence>
        ) : (
          <>
            <Navbar />
            <main className="flex-grow overflow-x-hidden w-full">
              {children}
            </main>
            <div className="fixed bottom-0 left-0 z-50">
              <SmallArcReactor
                onClick={handleTogglePortfolio}
                isSimplifiedView={showSimplifiedPortfolio}
              />
            </div>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
