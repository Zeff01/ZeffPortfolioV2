"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmallArcReactor from "@/components/SmallArcReactor";
import CursorReticle from "@/components/CursorReticle";
import SimplifiedPortfolio from "@/app/SimplifiedPortfolio";

interface PortfolioWrapperProps {
  children: React.ReactNode;
}

export default function PortfolioWrapper({ children }: PortfolioWrapperProps) {
  const [showSimplifiedPortfolio, setShowSimplifiedPortfolio] = useState(false);
  // The home page is a single, non-scrolling screen: pin it to the viewport and skip the footer.
  const isHome = usePathname() === "/";

  const handleTogglePortfolio = () => {
    setShowSimplifiedPortfolio(!showSimplifiedPortfolio);
  };

  return (
    <>
      {showSimplifiedPortfolio ? (
        <AnimatePresence>
          <SimplifiedPortfolio onClose={handleTogglePortfolio} />
        </AnimatePresence>
      ) : (
        <>
          <CursorReticle />
          <div className={isHome ? "fixed inset-0 flex flex-col overflow-hidden" : "contents"}>
            <Navbar />
            <main
              className={
                isHome
                  ? "min-h-0 flex-1 overflow-hidden w-full"
                  : "flex-grow overflow-x-hidden w-full"
              }
            >
              {children}
            </main>
          </div>
          <div className="fixed bottom-0 left-0 z-50">
            <SmallArcReactor
              onClick={handleTogglePortfolio}
              isSimplifiedView={showSimplifiedPortfolio}
            />
          </div>
          {!isHome && <Footer />}
        </>
      )}
    </>
  );
}