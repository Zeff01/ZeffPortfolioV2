"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import type { OrbState } from "./theme";

interface JarvisOrbProps {
  state: OrbState;
  hue: number;
  powerSave: boolean;
  /** Live voice loudness (0..1, or -1 when silent) — makes the core pulse with the real speech. */
  level?: () => number;
  className?: string;
}

interface StateParams {
  amplitude: number;
  speed: number;
  spin: number;
  ringSpeed: number;
}

/** How the orb "feels" in each state — mirrors openclaw's IDLE / THINKING / RESPONDING. */
const STATE_PARAMS: Record<OrbState, StateParams> = {
  idle: { amplitude: 0.045, speed: 0.6, spin: 0.08, ringSpeed: 0.12 },
  thinking: { amplitude: 0.09, speed: 2.4, spin: 0.55, ringSpeed: 0.7 },
  responding: { amplitude: 0.16, speed: 1.6, spin: 0.25, ringSpeed: 0.35 },
};

const ORB = {
  /** Pulse = base + gain × live voice level while Jarvis is speaking. */
  voicePulseBase: 0.55,
  voicePulseGain: 1.1,
  radius: 1,
  detail: 6,
  coreRadius: 0.24,
  particleCount: 900,
  ringInner: 1.45,
  ringOuter: 2.1,
  cameraZ: 4.6,
  /** Fraction of the gap closed per frame when easing toward target params. */
  ease: 0.06,
  /** Frames skipped between renders in power-save mode (60fps -> 15fps). */
  powerSaveStride: 4,
  maxPixelRatio: 2,
} as const;

const makeGlowTexture = (): THREE.CanvasTexture => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
};

/** Cheap layered-sine displacement — smooth, deterministic, no noise library needed. */
const displace = (x: number, y: number, z: number, t: number): number =>
  Math.sin(x * 3.1 + t * 1.3) * 0.5 +
  Math.sin(y * 2.7 - t * 1.7) * 0.35 +
  Math.sin(z * 3.7 + t * 0.9) * 0.3 +
  Math.sin((x + y + z) * 5.3 + t * 2.3) * 0.15;

/**
 * Three.js reactor orb, adapted from openclaw-jarvis-ui's orb visualizer:
 * a displaced wireframe shell, a glowing core and an orbiting particle band.
 * Draggable, reacts to the console state, pauses when scrolled off-screen.
 */
export default function JarvisOrb({ state, hue, powerSave, level, className }: JarvisOrbProps) {
  const mountRef = useRef<HTMLDivElement>(null);
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
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL — the CSS fallback ring behind the canvas stays visible.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, ORB.maxPixelRatio));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = ORB.cameraZ;

    const group = new THREE.Group();
    scene.add(group);

    // --- Wireframe shell ---
    const shellGeo = new THREE.IcosahedronGeometry(ORB.radius, ORB.detail);
    const base = Float32Array.from(shellGeo.attributes.position.array);
    const shellMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);

    // --- Core + glow ---
    const coreMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(ORB.coreRadius, 32, 32), coreMat);
    group.add(core);

    const glowTex = makeGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(2.6, 2.6, 1);
    group.add(glow);

    // --- Orbiting particle band ---
    const pPositions = new Float32Array(ORB.particleCount * 3);
    for (let i = 0; i < ORB.particleCount; i++) {
      // Deterministic spread (golden-angle) so the band looks even, not clumpy.
      const a = i * 2.399963;
      const r = ORB.ringInner + ((i * 0.6180339) % 1) * (ORB.ringOuter - ORB.ringInner);
      const h = Math.sin(i * 12.9898) * 0.18;
      pPositions[i * 3] = Math.cos(a) * r;
      pPositions[i * 3 + 1] = h;
      pPositions[i * 3 + 2] = Math.sin(a) * r;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.035,
      map: glowTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    particles.rotation.x = 0.42;
    scene.add(particles);

    // --- Sizing ---
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // --- Drag to rotate ---
    const drag = { active: false, x: 0, y: 0, rx: 0, ry: 0 };
    const onDown = (e: PointerEvent) => {
      drag.active = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.active) return;
      drag.ry += (e.clientX - drag.x) * 0.008;
      drag.rx += (e.clientY - drag.y) * 0.008;
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const onUp = () => {
      drag.active = false;
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointercancel", onUp);

    // --- Only animate while on screen ---
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    // --- Loop ---
    const live: StateParams = { ...STATE_PARAMS.idle };
    const color = new THREE.Color();
    const pos = shellGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    let t = 0;
    let frame = 0;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) {
        last = now;
        return;
      }
      frame++;
      if (powerSaveRef.current && frame % ORB.powerSaveStride !== 0) return;
      // Measured since the last *rendered* frame so power-save keeps real-time speed.
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;

      const target = STATE_PARAMS[stateRef.current];
      const motionScale = reduceMotion ? 0.15 : 1;
      (Object.keys(live) as (keyof StateParams)[]).forEach((k) => {
        live[k] += (target[k] - live[k]) * ORB.ease;
      });

      t += dt * live.speed * motionScale;

      // Responding: pulse with the real voice when there is one, otherwise a speech-like rhythm.
      const voiceLevel = levelRef.current?.() ?? -1;
      const pulse =
        stateRef.current !== "responding"
          ? 1
          : voiceLevel >= 0
            ? ORB.voicePulseBase + ORB.voicePulseGain * voiceLevel
            : 0.6 + 0.4 * Math.abs(Math.sin(t * 6.1) * Math.sin(t * 2.3));
      const amp = live.amplitude * pulse * motionScale;

      for (let i = 0; i < arr.length; i += 3) {
        const x = base[i];
        const y = base[i + 1];
        const z = base[i + 2];
        const d = 1 + displace(x, y, z, t) * amp;
        arr[i] = x * d;
        arr[i + 1] = y * d;
        arr[i + 2] = z * d;
      }
      pos.needsUpdate = true;

      const h = hueRef.current / 360;
      color.setHSL(h, 0.95, 0.58);
      shellMat.color.copy(color);
      pMat.color.copy(color);
      color.setHSL(h, 1, 0.7);
      coreMat.color.copy(color);
      color.setHSL(h, 1, 0.55);
      glowMat.color.copy(color);
      glowMat.opacity = 0.45 + 0.25 * pulse * (stateRef.current === "idle" ? 0.6 : 1);
      core.scale.setScalar(0.92 + 0.12 * pulse);

      const spinStep = dt * live.spin * motionScale;
      group.rotation.y += spinStep;
      group.rotation.x += (drag.rx - group.rotation.x) * 0.08;
      group.rotation.z = Math.sin(t * 0.3) * 0.08;
      // Horizontal drag spins the shell on top of the group's idle rotation.
      shell.rotation.y = drag.ry;
      particles.rotation.y += dt * live.ringSpeed * motionScale;

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointercancel", onUp);
      shellGeo.dispose();
      shellMat.dispose();
      core.geometry.dispose();
      coreMat.dispose();
      glowTex.dispose();
      glowMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={mountRef}
      className={`cursor-grab active:cursor-grabbing ${className ?? "relative"}`}
      data-hud-lock
      aria-label="Interactive J.A.R.V.I.S. reactor orb — drag to rotate"
      role="img"
    />
  );
}
