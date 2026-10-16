"use client";

import React, { useEffect, useState } from "react";
import { useJarvis } from "./JarvisProvider";
import { CONTACT } from "./jarvisBrain";
import { ORB_STATE_LABEL, type OrbState } from "./theme";
import { experienceData } from "@/data/experienceData";
import { workProjects, projects } from "@/data/projectsData";

interface JarvisVitalsProps {
  className?: string;
}

const CORE_LOAD: Record<OrbState, number> = { idle: 14, thinking: 82, responding: 57 };
const TICK_MS = 1000;
const POWER_SAVE_FPS_CAP = 15;
const FULL_FPS = 60;

const missionCount = new Set([...workProjects, ...projects].map((p) => p.title)).size;

const pad = (n: number) => String(n).padStart(2, "0");
const formatUptime = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

const Bar = ({ label, value, readout }: { label: string; value: number; readout: string }) => (
  <div>
    <div className="flex justify-between text-xs tracking-widest xl:text-sm">
      <span className="jv-dim">{label}</span>
      <span className="jv-accent">{readout}</span>
    </div>
    <div className="jv-bar-track mt-1.5 h-2 w-full overflow-hidden">
      <div className="jv-bar-fill h-full" style={{ width: `${Math.min(100, Math.max(3, value))}%` }} />
    </div>
  </div>
);

/**
 * openclaw's System Monitor, slimmed into a vertical HUD readout for the hero:
 * reactor state, live render FPS, session uptime, clock and career stats.
 */
export default function JarvisVitals({ className }: JarvisVitalsProps) {
  const { orbState, powerSave } = useJarvis();
  const [uptime, setUptime] = useState(0);
  const [clock, setClock] = useState("--:--:--");
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      setUptime(Math.floor((Date.now() - started) / 1000));
      setClock(new Date().toLocaleTimeString([], { hour12: false }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let frames = 0;
    let raf = 0;
    let windowStart = performance.now();
    const loop = (t: number) => {
      frames++;
      if (t - windowStart >= TICK_MS) {
        setFps(Math.round((frames * 1000) / (t - windowStart)));
        frames = 0;
        windowStart = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const renderFps = powerSave ? Math.min(fps, POWER_SAVE_FPS_CAP) : fps;

  return (
    <div className={`jv-panel space-y-4 px-5 py-5 ${className ?? ""}`} aria-label="System vitals">
      <div>
        <div className="jv-dim text-xs tracking-[0.3em] xl:text-sm">REACTOR STATUS</div>
        <div className="jv-glow-text text-2xl tracking-widest xl:text-3xl">{ORB_STATE_LABEL[orbState]}</div>
      </div>
      <Bar label="CORE" value={CORE_LOAD[orbState]} readout={`${CORE_LOAD[orbState]}%`} />
      <Bar label="RENDER" value={(renderFps / FULL_FPS) * 100} readout={`${renderFps} FPS`} />
      <div className="space-y-1.5 border-t border-[color:var(--jv-line)] pt-4 text-sm xl:text-base">
        <div className="flex justify-between">
          <span className="jv-dim tracking-widest">UPTIME</span>
          <span>{formatUptime(uptime)}</span>
        </div>
        <div className="flex justify-between">
          <span className="jv-dim tracking-widest">TIME</span>
          <span>{clock}</span>
        </div>
      </div>
      <div className="space-y-2.5 border-t border-[color:var(--jv-line)] pt-4">
        {[
          { label: "YEARS", value: CONTACT.yearsExperience },
          { label: "MISSIONS", value: String(missionCount) },
          { label: "CLIENTS", value: String(experienceData.length) },
        ].map((s) => (
          <div key={s.label} className="flex items-baseline justify-between">
            <span className="jv-dim text-xs tracking-widest xl:text-sm">{s.label}</span>
            <span className="jv-glow-text text-3xl leading-none xl:text-4xl">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
