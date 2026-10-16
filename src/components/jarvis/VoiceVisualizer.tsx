"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import type { OrbState } from "./theme";

interface VoiceVisualizerProps {
  state: OrbState;
  hue: number;
  powerSave: boolean;
  /** Live voice loudness (0..1, or -1 when silent). */
  level?: () => number;
  className?: string;
}

const VIS = {
  bars: 48,
  /** Base energy per state — used when there is no live audio stream (browser speech fallback). */
  energy: { idle: 0.08, thinking: 0.3, responding: 0.85 } as Record<OrbState, number>,
  ease: 0.08,
  /** Live audio: energy = floor + gain × level, eased faster so it tracks syllables. */
  liveFloor: 0.12,
  liveGain: 0.95,
  liveEase: 0.35,
  powerSaveStride: 4,
} as const;

/**
 * Three-layer voice visualizer from openclaw-jarvis-ui — spectrum bars,
 * concentric pulse rings and an oscilloscope waveform — drawn on one canvas.
 */
export default function VoiceVisualizer({ state, hue, powerSave, level, className }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const hueRef = useRef(hue);
  const powerSaveRef = useRef(powerSave);
  const levelRef = useRef(level);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    hueRef.current = hue;
  }, [hue]);
  useEffect(() => {
    powerSaveRef.current = powerSave;
  }, [powerSave]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let energy: number = VIS.energy.idle;
    let t = 0;
    let frame = 0;
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame++;
      if (powerSaveRef.current && frame % VIS.powerSaveStride !== 0) return;

      const step = powerSaveRef.current ? VIS.powerSaveStride : 1;
      t += 0.016 * step * (reduceMotion ? 0.2 : 1);
      const voiceLevel = levelRef.current?.() ?? -1;
      const [targetEnergy, ease] =
        voiceLevel >= 0
          ? [VIS.liveFloor + VIS.liveGain * voiceLevel, VIS.liveEase]
          : [VIS.energy[stateRef.current], VIS.ease];
      energy += (targetEnergy - energy) * Math.min(1, ease * step);

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const hueV = hueRef.current;
      ctx.clearRect(0, 0, w, h);

      // Layer 1 — spectrum bars (mirrored from center)
      const barW = w / VIS.bars;
      for (let i = 0; i < VIS.bars; i++) {
        const fromCenter = Math.abs(i - VIS.bars / 2) / (VIS.bars / 2);
        const wobble =
          0.5 + 0.5 * Math.sin(t * 7 + i * 0.7) * Math.sin(t * 3.3 + i * 0.31);
        const mag = Math.max(0.04, energy * (1 - fromCenter * 0.75) * wobble);
        const bh = mag * h * 0.8;
        ctx.fillStyle = `hsla(${hueV}, 95%, 60%, ${0.25 + mag * 0.6})`;
        ctx.fillRect(i * barW + 1, h - bh, barW - 2, bh);
      }

      // Layer 2 — concentric pulse rings
      const cx = w / 2;
      const cy = h / 2;
      for (let r = 0; r < 3; r++) {
        const phase = ((t * 0.6 + r / 3) % 1 + 1) % 1;
        const radius = 6 + phase * Math.min(w, h * 3) * 0.45 * (0.4 + energy);
        ctx.strokeStyle = `hsla(${hueV}, 95%, 65%, ${(1 - phase) * 0.35 * (0.3 + energy)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Layer 3 — oscilloscope waveform
      ctx.strokeStyle = `hsla(${hueV}, 100%, 75%, 0.9)`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = `hsla(${hueV}, 100%, 60%, 0.9)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const n = x / w;
        const envelope = Math.sin(n * Math.PI);
        const y =
          cy +
          envelope *
            energy *
            h *
            0.32 *
            (Math.sin(n * 22 + t * 9) * 0.6 + Math.sin(n * 47 - t * 13) * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduceMotion]);

  return <canvas ref={canvasRef} className={`block w-full ${className ?? ""}`} aria-hidden />;
}
