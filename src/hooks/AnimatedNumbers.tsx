"use client";

import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

import React from "react";

const AnimatedNumbers = ({
  value,
  duration,
  delayTimer,
}: {
  value: number;
  duration?: number;
  delayTimer?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration ? duration : 3000,
  });
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const delay = delayTimer ? delayTimer : 3000; // Delay in milliseconds

    springValue.on("change", (latest) => {
      if (ref.current && latest.toFixed(0) <= value) {
        setTimeout(() => {
          ref.current!.textContent = latest.toFixed(0);
        }, delay);
      }
    });
  }, [springValue, value]);

  return <span ref={ref}></span>;
};

export default AnimatedNumbers;
