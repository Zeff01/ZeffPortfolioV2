"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import Link from "next/link";

export default function Home() {
  const [showSecondImage, setShowSecondImage] = useState(false);
  const [showThirdImage, setShowThirdImage] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowSecondImage(true);
    }, 600);

    const timer2 = setTimeout(() => {
      setShowSecondImage(false);
      setShowThirdImage(true);
    }, 1000);

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

  return (
    <main className="h-full bg-blackBackground overflow-x-hidden font-tech">
      <div className="hidden font-tech h-1 bg-backgroundColor2 overflow-hidden w-screen"></div>

      <div className="h-screen overflow-hidden font-tech">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3 }}
          className="relative bg-backgroundColor2 transform skew-y-[-70deg] h-[1000px] md:h-[1800px] flex justify-center items-center"
        ></motion.div>

        {/* IRONMAN LANDINGPAGE LOGO ANIMATION */}
        <div className="absolute inset-0 flex items-center justify-center md:mr-16 overflow-hidden z-10 mt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ duration: 0.5, delay: 3.3 }}
            className="flex items-center justify-center"
          >
            <Image
              src="/ironmanassets/ironmanlandingspraysplat.png"
              alt="Ironman landing"
              width={1000}
              height={200}
              className="z-40"
            />
          </motion.div>
        </div>
        <div className="absolute top-20 right-4 z-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            transition={{ delay: 3.5 }}
          >
            <Image
              src="/ironmanassets/tech5.png"
              alt="tech5"
              width={150}
              height={1}
            />
          </motion.div>
        </div>

        {/* IRONMAN TECHLINES ANIMATION */}
        <div className="absolute bottom-2 md:bottom-10 right-2 flex flex-col gap-6 md:gap-12 items-center justify-center transform scale-x-[-1] w-[100px] md:w-[150px]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            transition={{ delay: 3.8 }}
          >
            <Image
              src="/ironmanassets/techlines2.png"
              alt="techlines2"
              width={150}
              height={1}
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            transition={{ delay: 3.9 }}
          >
            <Image
              src="/ironmanassets/techlines2.png"
              alt="techlines2"
              width={150}
              height={1}
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            transition={{ delay: 4 }}
          >
            <Image
              src="/ironmanassets/techlines2.png"
              alt="techlines2"
              width={150}
              height={1}
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            transition={{ delay: 4.1 }}
          >
            <Image
              src="/ironmanassets/techlines2.png"
              alt="techlines2"
              width={150}
              height={1}
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            transition={{ delay: 4.2 }}
          >
            <Image
              src="/ironmanassets/techlines2.png"
              alt="techlines2"
              width={150}
              height={1}
            />
          </motion.div>
        </div>

        {/* IRONMAN HOVER ANIMATION */}
        <motion.div
          initial={{ y: "70vh", opacity: 0, scale: 1 }}
          animate={{
            y: 50,
            opacity: 1,
            scale: [1, 1.8, 1.5, 1],
          }}
          className="absolute top-5 left-10 cursor-pointer w-12 h-12 md:w-20 md:h-20 z-30"
          transition={{ type: "spring", duration: 0.8, delay: 2 }}
        >
          <Image
            src="/ironmanassets/Ironmanhover.png"
            alt="Ironman Hover"
            width={80}
            height={80}
          />
        </motion.div>
        <motion.div
          className="ml-4 hidden md:flex gap-8 absolute bottom-0 left-12"
          initial={{ height: 0 }}
          animate={{ height: "78%" }}
          transition={{ duration: 0.4, delay: 2 }}
        >
          <div className="w-1 bg-yellow-500 rounded-full h-[100%]"></div>
          <div className="w-1 bg-yellow-500 rounded-full h-[100%]"></div>
        </motion.div>

        {/* NAME ANIMATION */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: [0.8, 1.2, 1],
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 3.5,
            },
          }}
          className="text-cyan-500 absolute left-[5%] sm:left-[10%] top-[20%] sm:top-[23%] flex flex-col gap-3 md:gap-4 z-20 w-[85%] sm:w-[80%] md:w-96 max-w-lg"
        >
          <h1 className="text-titleColor text-xl md:text-5xl font-bold">
            <span className="text-white font-light text-lg md:text-4xl">
              Hi! I'm
            </span>{" "}
            Zeff
          </h1>
          <TypeAnimation
            sequence={[
              "FullStack Developer",
              1000,
              " Solidity Developer",
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
              transition={{ duration: 0.3, delay: 3.6 }}
            >
              Github
            </motion.a>
            <motion.a
              href="/JzeffResume.pdf"
              download
              target="_blank"
              className="button-primary bg-buttonColor font-bold text-textColor border-buttonColor hover:border-2 hover:bg-textColor hover:text-buttonColor hover:scale-105 transform transition-all duration-300 py-1 md:py-2 px-3 flex-1 min-w-[120px] md:min-w-[140px] text-center"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 3.8 }}
            >
              Download CV
            </motion.a>
          </div>
        </motion.div>

        {/* IRONMAN FLYING ANIMATION */}
        <motion.div
          initial={{ x: "20vw" }}
          animate={{ x: "-100vw" }}
          transition={{ duration: 2, delay: 0, ease: customEasing }}
          className="absolute top-10 right-0 w-28 h-28 md:w-40 md:h-40 z-40"
        >
          {showThirdImage ? (
            <Image
              src="/ironmanassets/ironmanflying3.png"
              alt="Third Image"
              width={200}
              height={200}
            />
          ) : showSecondImage ? (
            <Image
              src="/ironmanassets/ironmanflying2.png"
              alt="Second Image"
              width={200}
              height={200}
            />
          ) : (
            <Image
              src="/ironmanassets/ironmantailpipe.png"
              alt="Ironman Flying"
              width={200}
              height={200}
            />
          )}
        </motion.div>
      </div>
    </main>
  );
}
