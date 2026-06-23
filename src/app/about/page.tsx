"use client";

import dynamic from "next/dynamic";
import TransitionEffect from "@/hooks/TransitionEffect";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import AnimatedNumbers from "@/hooks/AnimatedNumbers";
import Link from "next/link";

// Lazy load heavy components
const Experience = dynamic(() => import("./components/Experience"), {
  loading: () => (
    <div className="text-center text-gray-400">Loading experience...</div>
  ),
});
const Skills = dynamic(() => import("./components/Skills"), {
  loading: () => (
    <div className="text-center text-gray-400">Loading skills...</div>
  ),
});

const stats = [
  { value: 20, suffix: "+", label: "Satisfied Clients" },
  { value: 40, suffix: "+", label: "Projects Completed" },
  { value: 4, suffix: "+", label: "Years of Experience" },
  { value: 100, suffix: "+", label: "Interns Mentored" },
  { value: 86, suffix: "", label: "GitHub Repos" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const About = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative h-full overflow-x-hidden bg-transparent">
      <TransitionEffect />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-buttonColor/20 blur-[130px]" />
        <div className="absolute right-[-8rem] top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-textColor/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto mt-16 flex max-w-7xl flex-col justify-between gap-6 p-4 md:mt-8 md:p-8 lg:flex-row">
        {/* LEFT COLUMN */}
        <div className="flex flex-1 flex-col">
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-tech text-3xl text-buttonColor sm:text-4xl md:text-5xl lg:text-6xl"
          >
            "Dream Big,{" "}
            <span className="text-textColor">Achieve Greatness!</span>"
          </motion.p>

          <div className="flex w-full flex-col">
            {/* BIOGRAPHY */}
            <div className="mt-6 font-tech text-base font-medium text-white md:text-lg">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-4 block text-2xl sm:text-3xl md:text-4xl"
              >
                Greetings! My name is
                <span className="text-yellow-300"> Zeff</span>,
              </motion.span>
              <div className="space-y-6 text-gray-400">
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  Hello! I'm the person behind the keyboard who loves to bring
                  ideas to life through code. With a knack for both the logic of
                  backend development and the finesse of frontend design, I've
                  spent my career as a{" "}
                  <span className="text-buttonColor">
                    Full Stack Developer{" "}
                  </span>
                  navigating the complexities of software development. My
                  journey has taken me across the globe, virtually speaking,
                  working with an incredible array of clients from different
                  cultures. This has not only sharpened my technical skills but
                  also taught me the importance of clear communication and
                  understanding diverse perspectives.
                </motion.p>
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  My approach to technology is simple: it's about making things
                  that work beautifully, both inside and out. Whether I'm
                  debugging a back-end system or polishing a user interface, my
                  goal is to create something that's not just functional, but
                  also a joy to use. This passion extends beyond my work. I
                  founded{" "}
                  <Link
                    href="https://Codebility.tech"
                    target="_blank"
                    className="text-cyan-500 hover:text-cyan-200 cursor-pointer"
                  >
                    Codebility
                  </Link>
                  , a community where I share my love for coding by teaching
                  others for free. It's my way of giving back, hoping to light
                  the same spark in others that coding ignited in me.
                </motion.p>
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                >
                  At the heart of it all, I'm a problem solver, a creative
                  thinker, and a team player who believes in the power of
                  collaboration. Each new project is an adventure—an opportunity
                  to challenge myself, learn new things, and contribute to
                  making the digital world a bit more user-friendly. I'm excited
                  about the possibility of bringing my blend of skills,
                  experience, and passion to your team. Let's create something
                  great together!
                </motion.p>
              </div>
            </div>

            {/* PICTURE */}
            <motion.div
              className="relative my-10 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* glow + rotating ring behind the portrait */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-buttonColor/20 blur-[80px]" />
              <svg
                viewBox="0 0 400 400"
                className="hud-spin pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] max-w-none -translate-x-1/2 -translate-y-1/2 text-cyan-400/30"
                style={{ transformOrigin: "center" }}
              >
                <circle
                  cx="200"
                  cy="200"
                  r="196"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 14"
                />
              </svg>
              <motion.div
                whileHover={{ scale: 1.05 }}
                onMouseEnter={handleFlip}
                onMouseLeave={handleFlip}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Image
                  src={"/ironmanassets/ironmanpolydp.png"}
                  alt="MyProfile"
                  width={600}
                  height={600}
                  className="h-auto max-w-full object-contain"
                />
              </motion.div>
            </motion.div>

            {/* NUMBERS */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.12 }}
              className="mb-12 mt-4 w-full font-tech"
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
                {stats.map((s) => (
                  <motion.div
                    key={s.label}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-6 text-center shadow-lg shadow-black/30 backdrop-blur transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.22)]"
                  >
                    <span className="text-3xl font-bold text-buttonColor transition-colors group-hover:text-textColor sm:text-4xl md:text-5xl">
                      <AnimatedNumbers value={s.value} suffix={s.suffix} />
                    </span>
                    <span className="mt-2 text-sm font-medium text-textColor md:text-base">
                      {s.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <Skills />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1">
          <Experience />
        </div>
      </div>
    </div>
  );
};

export default About;
