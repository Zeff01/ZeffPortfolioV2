"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import Link from "next/link";
import dynamic from "next/dynamic";
import HeroHud from "@/components/HeroHud";
import DecryptText from "@/components/DecryptText";

import { JarvisRoot } from "@/components/jarvis/JarvisProvider";
import JarvisHoloCard from "@/components/jarvis/JarvisHoloCard";
import JarvisComms from "@/components/jarvis/JarvisComms";
import JarvisVitals from "@/components/jarvis/JarvisVitals";
import JarvisWave from "@/components/jarvis/JarvisWave";

// WebGL — client only, and keeps three.js out of the initial hero bundle.
const JarvisHeroOrb = dynamic(() => import("@/components/jarvis/JarvisHeroOrb"), {
  ssr: false,
});

/**
 * The intro used to take ~4.5 s before the name and Jarvis appeared. Every cue
 * now runs at INTRO.speed of its original time (~2 s in total), which also
 * brings the largest paint forward.
 */
const INTRO = {
  speed: 0.42,
  flybyDuration: 1.2,
  /** Tail-pipe → mid-flight → full-flight frame swaps during the fly-by. */
  flybyFrameMs: [360, 600],
} as const;

export default function Home() {
  const [showSecondImage, setShowSecondImage] = useState(false);
  const [showThirdImage, setShowThirdImage] = useState(false);
  const reduceMotion = useReducedMotion();
  /** Intro timeline: original cue (s) → compressed so the hero lands fast; instant under reduced motion. */
  const at = (seconds: number) => (reduceMotion ? 0 : seconds * INTRO.speed);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowSecondImage(true);
    }, INTRO.flybyFrameMs[0]);

    const timer2 = setTimeout(() => {
      setShowSecondImage(false);
      setShowThirdImage(true);
    }, INTRO.flybyFrameMs[1]);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const customEasing = [0.42, 0, 0.58, 1];
  const imageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };
  const containerVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1 },
  };

  // --- Interactive parallax (mouse-driven depth) ---
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });

  // Each layer shifts by a different depth factor (px). Negative = opposite drift.
  const splatX = useTransform(sx, (v) => v * 18);
  const splatY = useTransform(sy, (v) => v * 18);
  const tech5X = useTransform(sx, (v) => v * -28);
  const tech5Y = useTransform(sy, (v) => v * -28);
  const heroX = useTransform(sx, (v) => v * 55);
  const heroY = useTransform(sy, (v) => v * 55);
  const nameX = useTransform(sx, (v) => v * -22);
  const nameY = useTransform(sy, (v) => v * -22);

  const handlePointerMove = (e: React.MouseEvent) => {
    if (reduceMotion) return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  // Continuous idle loop helper — disabled entirely under reduced motion.
  const idle = (
    animate: Record<string, number[] | string[]>,
    transition: Record<string, number | string>
  ) =>
    reduceMotion
      ? {}
      : {
          animate,
          transition: { repeat: Infinity, ease: "easeInOut", ...transition },
        };

  return (
    <main className="h-full bg-blackBackground overflow-hidden font-tech">
      <div className="hidden font-tech h-1 bg-backgroundColor2 overflow-hidden w-screen"></div>

      <JarvisRoot className="h-full">
      <div
        className="h-full overflow-hidden font-tech"
        onMouseMove={handlePointerMove}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: at(3) }}
          className="relative bg-backgroundColor2 transform skew-y-[-70deg] h-[1000px] md:h-[1800px] flex justify-center items-center"
        ></motion.div>

        {/* JARVIS-style HUD overlay */}
        <HeroHud />

        {/* J.A.R.V.I.S. REACTOR ORB — centred on Iron Man's chest reactor, shares the splat's parallax */}
        <motion.div
          style={{ x: splatX, y: splatY }}
          className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center md:mr-16 mt-20 pl-[26vw] pb-[4vh] md:pl-[9vw] md:pb-[12vh]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: at(3.2), ease: "easeOut" }}
            className="h-[min(115vw,560px)] w-[130vw] shrink-0 md:h-[100vh] md:w-[min(125vh,100vw)]"
          >
            <JarvisHeroOrb className="relative h-full w-full" />
          </motion.div>
        </motion.div>

        {/* IRONMAN LANDINGPAGE LOGO ANIMATION */}
        <motion.div
          style={{ x: splatX, y: splatY }}
          className="absolute inset-0 flex items-center justify-center md:mr-16 overflow-hidden z-10 mt-20"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ duration: 0.5, delay: at(3.3) }}
            className="flex items-center justify-center"
          >
            {/* idle: slow breathing */}
            <motion.div {...idle({ scale: [1, 1.04, 1] }, { duration: 6, delay: at(4) })}>
              <Image
                src="/ironmanassets/ironmanlandingspraysplat.png"
                alt="Ironman landing"
                width={1000}
                height={1000}
                className="z-40"
                priority
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ x: tech5X, y: tech5Y }}
          className="absolute top-20 right-4 z-20"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            transition={{ delay: at(3.5) }}
          >
            {/* idle: gentle float */}
            <motion.div {...idle({ y: [0, -8, 0] }, { duration: 4, delay: at(4.5) })}>
              <Image
                src="/ironmanassets/tech5.png"
                alt="tech5"
                width={530}
                height={461}
                className="w-[150px] h-auto"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* IRONMAN HOVER ANIMATION */}
        <motion.div
          style={{ x: heroX, y: heroY }}
          className="absolute top-5 left-10 cursor-pointer w-12 h-12 md:w-20 md:h-20 z-30"
        >
          <motion.div
            initial={{ y: "70vh", opacity: 0, scale: 1 }}
            animate={{
              y: 50,
              opacity: 1,
              scale: [1, 1.8, 1.5, 1],
            }}
            transition={{ type: "spring", duration: 0.8, delay: at(2) }}
          >
            {/* idle: hovering bob */}
            <motion.div {...idle({ y: [0, -12, 0] }, { duration: 3.5, delay: at(4.5) })}>
              <Image
                src="/ironmanassets/Ironmanhover.png"
                alt="Ironman Hover"
                width={861}
                height={2246}
                className="w-full h-auto"
                priority
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="ml-4 hidden md:flex gap-8 absolute bottom-0 left-12"
          initial={{ height: 0 }}
          animate={{ height: "78%" }}
          transition={{ duration: 0.4, delay: at(2) }}
        >
          {/* idle: pulsing arc-reactor glow, offset for a wave */}
          <motion.div
            className="w-1 bg-yellow-500 rounded-full h-[100%]"
            {...idle(
              {
                boxShadow: [
                  "0 0 6px rgba(234,179,8,0.5)",
                  "0 0 18px rgba(234,179,8,0.95)",
                  "0 0 6px rgba(234,179,8,0.5)",
                ],
              },
              { duration: 2.2, delay: at(2.5) }
            )}
          ></motion.div>
          <motion.div
            className="w-1 bg-yellow-500 rounded-full h-[100%]"
            {...idle(
              {
                boxShadow: [
                  "0 0 6px rgba(234,179,8,0.5)",
                  "0 0 18px rgba(234,179,8,0.95)",
                  "0 0 6px rgba(234,179,8,0.5)",
                ],
              },
              { duration: 2.2, delay: at(3.1) }
            )}
          ></motion.div>
        </motion.div>

        {/* NAME ANIMATION */}
        <motion.div
          data-jarvis-tour="hero"
          style={{ x: nameX, y: nameY }}
          className="absolute left-[5%] sm:left-[10%] top-[20%] sm:top-[23%] z-20 w-[85%] sm:w-[80%] md:w-96 max-w-lg"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: [0.8, 1.1, 1],
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: at(3.5),
              },
            }}
            className="text-cyan-500 flex flex-col gap-3 md:gap-4"
          >
            <h1 className="text-titleColor text-xl md:text-5xl font-bold">
              <span className="text-white font-light text-lg md:text-4xl">
                Hi! I'm
              </span>{" "}
              <DecryptText text="Zeff" startDelay={at(3.7) * 1000} />
            </h1>
            <TypeAnimation
              sequence={[
                "AI Engineer",
                1000,
                "Fullstack Developer",
                1000,
                "Blockchain Developer",
                1000,
              ]}
              className="text-titleColor text-sm md:text-2xl lg:text-4xl text-textColor"
              wrapper="div"
              cursor={true}
              speed={60}
              repeat={Infinity}
              style={{ fontSize: "1.5em", lineHeight: "1.2" }}
            />
            <motion.div
              className="button-primary border-textColor text-textColor text-sm md:text-[20px] hover:border-buttonColor hover:text-buttonColor hover:scale-105 transform transition-all duration-300 w-full max-w-[140px] text-center px-2 py-1 md:py-2 bg-[#0808087b]"
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/about" className="block w-full">
                More about me
              </Link>
            </motion.div>
            {/* BUTTON ANIMATION */}
            <div className="flex flex-wrap gap-3 md:gap-6 z-10 w-full max-w-[280px] md:max-w-[340px] text-xs md:text-[18px] mt-2 md:mt-4">
              <motion.a
                href="https://github.com/Zeff01"
                target="_blank"
                className="button-primary text-buttonColor bg-textColor border-textColor font-bold hover:border-2 hover:bg-buttonColor hover:text-textColor hover:scale-105 transform transition-all duration-300 py-1 md:py-2 px-3 flex-1 min-w-[120px] md:min-w-[140px] text-center"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: at(3.6) }}
                whileHover={{ scale: 1.05 }}
              >
                Github
              </motion.a>
              <motion.a
                href="/resume/pdf?download=1"
                download="Zeff-Somera-Resume.pdf"
                target="_blank"
                className="button-primary bg-buttonColor font-bold text-textColor border-buttonColor hover:border-2 hover:bg-textColor hover:text-buttonColor hover:scale-105 transform transition-all duration-300 py-1 md:py-2 px-3 flex-1 min-w-[120px] md:min-w-[140px] text-center"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: at(3.8) }}
                whileHover={{ scale: 1.05 }}
              >
                Download CV
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        {/* J.A.R.V.I.S. COMMS — docked under the intro on desktop, bottom dock on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: at(4) }}
          className="absolute z-30 bottom-3 left-[88px] right-3 h-[min(170px,22vh)] sm:left-[10%] sm:right-auto sm:w-[80%] md:bottom-16 md:w-[400px] md:h-[max(220px,calc(77vh-335px))] lg:w-[440px] xl:w-[480px]"
        >
          <JarvisComms className="h-full" />
        </motion.div>

        {/* J.A.R.V.I.S. HOLO CARD — the project he's talking about, front and centre */}
        <JarvisHoloCard />

        {/* J.A.R.V.I.S. VITALS — readout on the right */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: at(4.2) }}
          className="absolute right-6 top-[225px] z-30 hidden w-[250px] lg:block xl:w-[290px]"
        >
          <JarvisVitals />
        </motion.div>

        {/* J.A.R.V.I.S. VOICE WAVEFORM — under Iron Man */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: at(4) }}
          className="pointer-events-none absolute bottom-5 left-[55%] z-20 hidden h-10 w-[min(380px,30vw)] -translate-x-1/2 md:block"
        >
          <JarvisWave className="h-full" />
        </motion.div>

        {/* IRONMAN FLYING ANIMATION — hidden under reduced motion (CSS, so SSR markup matches) */}
        <motion.div
          initial={{ x: "20vw" }}
          animate={{ x: "-100vw" }}
          transition={{ duration: INTRO.flybyDuration, delay: 0, ease: customEasing }}
          className="absolute top-10 right-0 w-28 h-28 md:w-40 md:h-40 z-40 motion-reduce:hidden"
        >
          {showThirdImage ? (
            <Image
              src="/ironmanassets/ironmanflying3.png"
              alt="Third Image"
              width={200}
              height={200}
              priority
            />
          ) : showSecondImage ? (
            <Image
              src="/ironmanassets/ironmanflying2.png"
              alt="Second Image"
              width={200}
              height={200}
              priority
            />
          ) : (
            <Image
              src="/ironmanassets/ironmantailpipe.png"
              alt="Ironman Flying"
              width={200}
              height={200}
              priority
            />
          )}
        </motion.div>
      </div>
      </JarvisRoot>
    </main>
  );
}
