"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmallArcReactor from "@/components/SmallArcReactor";
import SimplifiedPortfolio from "@/app/SimplifiedPortfolio";

interface PortfolioWrapperProps {
  children: React.ReactNode;
}

export default function PortfolioWrapper({ children }: PortfolioWrapperProps) {
  const [showSimplifiedPortfolio, setShowSimplifiedPortfolio] = useState(false);

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
    </>
  );
}