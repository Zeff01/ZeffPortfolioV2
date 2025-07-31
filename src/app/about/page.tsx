"use client";

import Experience from "./components/Experience";
import Skills from "./components/Skills";
import TransitionEffect from "@/hooks/TransitionEffect";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import AnimatedNumbers from "@/hooks/AnimatedNumbers";
import Link from "next/link";

const About = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  return (
    <div className="h-full bg-[#0c0a0a] overflow-x-hidden relative">
      <TransitionEffect />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between p-4 md:p-8 mt-16 md:mt-8 gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col">
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.8 }}
            className="font-tech text-buttonColor text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
          >
            "Dream Big,{" "}
            <span className="text-textColor">Achieve Greatness!</span>"
          </motion.p>
          <div className="w-full flex flex-col">
            {/* BIOGRAPHY */}
            <div className="text-white font-medium font-tech text-base md:text-lg mt-6">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 3 }}
                className="text-2xl sm:text-3xl md:text-4xl block mb-4"
              >
                Greetings! My name is
                <span className="text-yellow-300"> Zeff</span>,
              </motion.span>
              <div className="text-gray-500 space-y-6">
                <motion.p
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 2.5 }}
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
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 2.5 }}
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
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 2.5 }}
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
              className="flex justify-center my-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={handleFlip}
              onMouseLeave={handleFlip}
              transition={{ duration: 1, delay: 2.5 }}
            >
              <Image
                src={"/ironmanassets/ironmanpolydp.png"}
                alt="MyProfile"
                width={600}
                height={600}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* NUMBERS */}
            <div className="font-tech w-full mt-4 mb-12">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
                <div className="flex flex-col justify-center items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.8 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-buttonColor"
                  >
                    <AnimatedNumbers value={20} />+
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.8 }}
                    className="text-base md:text-lg lg:text-xl font-medium text-textColor text-center"
                  >
                    Satisfied Clients
                  </motion.h2>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.8 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-buttonColor"
                  >
                    <AnimatedNumbers value={40} />+
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.4 }}
                    className="text-base md:text-lg lg:text-xl font-medium text-textColor text-center"
                  >
                    Projects Completed
                  </motion.h2>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.2 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-buttonColor"
                  >
                    <AnimatedNumbers value={4} />+
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="text-base md:text-lg lg:text-xl font-medium text-textColor text-center"
                  >
                    Years of Experience
                  </motion.h2>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.2 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-buttonColor"
                  >
                    <AnimatedNumbers value={100} />+
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="text-base md:text-lg lg:text-xl font-medium text-textColor text-center"
                  >
                    Interns Mentored
                  </motion.h2>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.2 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-buttonColor"
                  >
                    <AnimatedNumbers value={86} />
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="text-base md:text-lg lg:text-xl font-medium text-textColor text-center"
                  >
                    GitHub Repos
                  </motion.h2>
                </div>
              </div>
            </div>
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
