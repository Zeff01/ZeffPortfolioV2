"use client";

import React, { useEffect, useState } from "react";
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
  duration = 2,
  delay = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    const element = document.getElementById(`counter-${value}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [value]);

  return (
    <span id={`counter-${value}`}>
      {isVisible && (
        <CountUp
          start={0}
          end={value}
          duration={duration}
          delay={delay}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          separator=""
          enableScrollSpy
          scrollSpyDelay={delay}
        >
          {({ countUpRef }) => <span ref={countUpRef} />}
        </CountUp>
      )}
    </span>
  );
};

export default AnimatedNumber;
