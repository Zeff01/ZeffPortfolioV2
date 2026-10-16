"use client";

import React from "react";
import VoiceVisualizer from "./VoiceVisualizer";
import { useJarvis } from "./JarvisProvider";

interface JarvisWaveProps {
  className?: string;
}

/** Voice waveform bound to the shared Jarvis state — pulses whenever Jarvis talks. */
export default function JarvisWave({ className }: JarvisWaveProps) {
  const { orbState, theme, powerSave, level } = useJarvis();
  return <VoiceVisualizer state={orbState} hue={theme.hue} powerSave={powerSave} level={level} className={className} />;
}
