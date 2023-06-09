"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const TransitionEffect = () => {
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
  return (
    <>
      <motion.div
        className="absolute top-0 bottom-0 right-full w-screen h-full z-30 bg-yellow-500"
        initial={{ x: "-10%", width: "0%" }}
        animate={{ x: "110%", width: "100%" }}
        transition={{ delay: 0.2, duration: 2.5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 bottom-0 right-full w-screen h-full z-30 bg-backgroundColor2"
        initial={{ x: "-10%", width: "0%" }}
        animate={{ x: "110%", width: "100%" }}
        transition={{ delay: 0.3, duration: 2.5, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ x: "-100vw" }}
        animate={{ x: "100vw" }}
        transition={{ duration: 3, delay: 0, ease: customEasing }}
        className="absolute top-10 right-0 w-28 h-28 md:w-40 md:h-40 "
      >
        {showThirdImage ? (
          <Image
            src="/ironmanassets/ironmantailpipe.png" // Replace with your third image path
            alt="Third Image"
            width={200}
            height={200}
            className="scale-x-[-1]"
          />
        ) : showSecondImage ? (
          <Image
            src="/ironmanflying2.png" // Replace with your second image path
            alt="Second Image"
            width={200}
            height={200}
            className="scale-x-[-1]"
          />
        ) : (
          <Image
            src="/ironmanflying3.png"
            alt="Ironman Flying"
            width={200}
            height={200}
            className="scale-x-[-1]"
          />
        )}
      </motion.div>
    </>
  );
};

export default TransitionEffect;
