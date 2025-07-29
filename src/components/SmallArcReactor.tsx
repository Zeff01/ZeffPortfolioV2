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
        className="bottom-4 fixed left-4 z-10 cursor-pointer md:bottom-4 md:left-4 sm:bottom-2 sm:left-2"
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

      {/* Animated arrow pointing to the reactor */}
      <motion.div
        className="fixed bottom-6 left-16 z-20 pointer-events-none opacity-0 group-hover:opacity-80 hidden md:block"
        initial={{ opacity: 0, x: 10 }}
        animate={{
          opacity: [0, 0.8, 0],
          x: [10, 0, 10],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: 0.2,
        }}
      >
        <div className="flex items-center mb-4 ml-8">
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{
              rotate: [0, 0, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="rgba(246, 174, 42, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>

          <motion.div
            className="text-xs font-mono text-amber-400 tracking-tight "
            animate={{
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {isSimplifiedView ? "Go Expanded" : "Go Simple"}
          </motion.div>
        </div>
      </motion.div>

      {/* Add a subtle glow effect on hover */}
      <motion.div
        className="fixed bottom-4 left-4 w-16 h-16 rounded-full group-hover:opacity-50 z-5 pointer-events-none md:bottom-4 md:left-4 sm:bottom-2 sm:left-2 sm:w-14 sm:h-14"
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
