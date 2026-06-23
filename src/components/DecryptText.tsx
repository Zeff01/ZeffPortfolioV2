"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface DecryptTextProps {
  text: string;
  className?: string;
  /** ms before the decrypt animation starts */
  startDelay?: number;
}

const GLYPHS = "ⱯΛ¥#%&/()=?*+0101!<>-_\\[]{}";

/**
 * Reveals `text` with a "decrypting" scramble — each character cycles through
 * glyphs before locking into place, left to right. Falls back to plain text
 * under prefers-reduced-motion. Initial render is the final text (no hydration
 * mismatch); the scramble only runs after mount + startDelay.
 */
const DecryptText: React.FC<DecryptTextProps> = ({
  text,
  className,
  startDelay = 0,
}) => {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    let interval: ReturnType<typeof setInterval>;
    const endFrame = text.length * 4 + 3;

    const start = setTimeout(() => {
      interval = setInterval(() => {
        frame++;
        const out = text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            const revealAt = (i + 1) * 4;
            if (frame >= revealAt) return ch;
            return GLYPHS[(frame * 7 + i * 13) % GLYPHS.length];
          })
          .join("");
        setDisplay(out);
        if (frame >= endFrame) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, 45);
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, reduceMotion, startDelay]);

  return <span className={className}>{display}</span>;
};

export default DecryptText;
