"use client";

import React, { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 2.5,
  delay = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref}>
      {isVisible ? (
        <CountUp
          start={0}
          end={value}
          duration={duration}
          delay={delay}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          separator=""
        />
      ) : (
        <span>
          {prefix}
          {(0).toFixed(decimals)}
          {suffix}
        </span>
      )}
    </span>
  );
};

export default AnimatedNumber;
