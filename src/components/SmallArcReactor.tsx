import React from "react";
import "../app/arcreactor.css";
import { motion } from "framer-motion";

interface SmallArcReactorProps {
  onClick?: () => void;
  isSimplifiedView?: boolean;
}

const SmallArcReactor = ({
  onClick,
  isSimplifiedView = false,
}: SmallArcReactorProps) => {
  return (
    <div className="relative group">
      <div
        className="bottom-4 fixed left-4 z-10 cursor-pointer"
        onClick={onClick}
      >
        <div className="arc_reactor_small">
          <div className="case_container_small">
            <div className="e7_small">
              <div className="semi_arc_3_small e5_1">
                <div className="semi_arc_3_small e5_2">
                  <div className="semi_arc_3_small e5_3">
                    <div className="semi_arc_3_small e5_4"></div>
                  </div>
                </div>
              </div>
              <div className="core2_small"></div>
            </div>
            <ul className="marks_small">
              {Array.from({ length: 60 }, (_, index) => (
                <li key={index}></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tooltip that appears on hover - positioned outside */}
      <div className="fixed bottom-4 left-24 group-hover:opacity-100 transition-opacity duration-300 z-20 whitespace-nowrap pointer-events-none">
        <div className="bg-zinc-900/90 border border-zinc-700 text-white text-sm py-2 px-4 rounded-lg shadow-lg">
          {isSimplifiedView
            ? "<- Go to expanded portfolio"
            : "<- Go to simplified portfolio"}
        </div>
      </div>

      {/* Add a subtle glow effect on hover */}
      <motion.div
        className="fixed bottom-4 left-4 w-16 h-16 rounded-full  group-hover:opacity-50 z-5 pointer-events-none"
        animate={{
          boxShadow: [
            "0 0 15px 5px rgba(246, 174, 42, 0.3)",
            "0 0 25px 8px rgba(246, 174, 42, 0.5)",
            "0 0 15px 5px rgba(246, 174, 42, 0.3)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

export default SmallArcReactor;
