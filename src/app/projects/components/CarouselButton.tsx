import React from "react";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { motion } from "framer-motion";

interface CarouselButtonProps {
  previous: () => void;
  next: () => void;
}

const CarouselButton = ({ previous, next }: CarouselButtonProps) => {
  return (
    <div className="mx-auto flex gap-4 z-50 ">
      <motion.button
        className="w-16 md:w-20 h-16 md:h-28 bg-black text-yellow-500 shadow-md shadow-[#ffd56cc3] flex items-center justify-center rounded-md"
        onClick={previous}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        initial={{
          opacity: 0,
          scale: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 2.9 + 0.4,
        }}
      >
        <MdOutlineArrowBackIos className="w-6 h-6 md:w-8 md:h-8" />
      </motion.button>
      <motion.button
        className="w-16 md:w-20 h-16 md:h-28 text-black bg-yellow-500 shadow-md shadow-[#ffd56cc3] flex items-center justify-center rounded-md"
        onClick={next}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        initial={{
          opacity: 0,
          scale: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 2.9 + 0.5,
        }}
      >
        <MdOutlineArrowForwardIos className="w-6 h-6 md:w-8 md:h-8" />
      </motion.button>
    </div>
  );
};

export default CarouselButton;
