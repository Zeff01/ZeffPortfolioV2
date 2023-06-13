"use client";

import Experience from "./components/Experience";
import Navbar from "@/components/Navbar";
import Skills from "./components/Skills";
import TransitionEffect from "@/hooks/TransitionEffect";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import AnimatedNumbers from "@/hooks/AnimatedNumbers";
import ArcReactor from "@/components/ArcReactor";

const About = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  return (
    <div className="h-full min-h-screen  bg-[#0c0a0a]  overflow-x-hidden  relative ">
      <Navbar />
      <TransitionEffect />
      <div className="relative  w-full text-white ">
        <div className=" flex flex-col gap-8 md:gap-16 justify-center items-center h-full lg:h-screen w-full mt-32 ">
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="font-tech text-buttonColor text-2xl md:text-7xl"
          >
            "Dream Big,{" "}
            <span className="text-textColor">Achieve Greatness!</span>"
          </motion.p>
          <div className="px-2 md:flex md:flex-col  lg:grid  lg:grid-cols-8 gap-16 w-full">
            {/* BIOGRAPHY */}
            <div className="col-span-2 lg:col-span-3 p-2 text-yellow-300 font-medium font-tech text-lg ml-2 text-justify xl:text-2xl md:text-lg">
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 2.5 }}
              >
                Greetings! My name is{" "}
                <span className="text-cyan-500">Zeff</span>, and I bring a
                welcoming and approachable attitude, along with a strong set of
                technical skills. I excel in resolving conflicts and fostering
                team collaboration, offering effective solutions that deliver
                immediate results and contribute to long-term success. With a
                keen eye for detail, I am committed, competent, and adaptable,
                consistently exceeding expectations to help organizations
                achieve their objectives. Furthermore, I have a profound passion
                for creative design and user interface (UI) design. I am
                dedicated to creating designs that are not only visually
                appealing but also efficient and user-friendly.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 2.5 }}
                className="mt-5"
              >
                No matter the nature of the project, whether it's a website,
                mobile app, or any other digital product, I approach each
                endeavor with unwavering dedication to achieving design
                excellence and prioritizing the needs of users. With enthusiasm
                and a keen eye for detail, I eagerly anticipate the chance to
                contribute my skills and passion to your upcoming project.
              </motion.p>
            </div>

            {/* PICTURE */}
            <motion.div
              className="col-span-3 flex justify-center shadow-lg  shadow-yellow-500 hover:shadow-red-500  rounded-lg  mt-5 md:mt-0 object-contain cursor-pointer h-[500px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              onMouseEnter={handleFlip}
              onMouseLeave={handleFlip}
              transition={{ duration: 1, delay: 2.5 }}
            >
              <Image
                src={
                  isFlipped
                    ? "/ironmanassets/ironmanpolydp.png"
                    : "/ironmanassets/zeffdp.png"
                }
                alt="Third Image"
                width={400}
                height={100}
                className=" object-contain"
              />
            </motion.div>

            {/* NUMBERS */}
            <div className="lg:col-span-2 flex lg:flex-col items-center justify-between font-tech pr-4 w-full mt-5 md:mt-0 col-span-4">
              <div className="flex flex-col justify-center items-center md:items-end">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 3 }}
                  className="inline-block text-2xl md:text-8xl text-buttonColor"
                >
                  <AnimatedNumbers value={20} />+
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2.8 }}
                  className="text-sm md:text-xl font-medium capitalize text-textColor"
                >
                  Satisfied Clients
                </motion.h2>
              </div>
              <div className="flex flex-col justify-center items-center md:items-end">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2.6 }}
                  className="inline-block text-2xl md:text-8xl text-buttonColor"
                >
                  <AnimatedNumbers value={10} />+
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2.4 }}
                  className="text-sm md:text-xl font-medium capitalize text-textColor"
                >
                  Projects Completed
                </motion.h2>
              </div>
              <div className="flex flex-col justify-center items-center md:items-end">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2.2 }}
                  className="inline-block text-2xl md:text-8xl text-buttonColor"
                >
                  <AnimatedNumbers value={2} />+
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2 }}
                  className="text-sm md:text-xl font-medium capitalize text-textColor"
                >
                  Years of Experience
                </motion.h2>
              </div>
            </div>
          </div>
          <div></div>
        </div>

        <div>
          <Skills />
          <Experience />
        </div>
      </div>
      <ArcReactor />
      <Footer />
    </div>
  );
};

export default About;
