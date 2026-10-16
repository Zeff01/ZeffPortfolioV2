"use client";

import React from "react";
import JarvisOrb from "./JarvisOrb";
import { useJarvis } from "./JarvisProvider";

interface JarvisHeroOrbProps {
  className?: string;
}

/** The reactor orb bound to the shared Jarvis state (lazy-loaded with three.js). */
export default function JarvisHeroOrb({ className }: JarvisHeroOrbProps) {
  const { orbState, theme, powerSave, level } = useJarvis();
  return <JarvisOrb state={orbState} hue={theme.hue} powerSave={powerSave} level={level} className={className} />;
}
