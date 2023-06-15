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
    <div className="mx-auto flex gap-4 ">
      <motion.button
        className="w-16 md:w-20 h-16 md:h-20 bg-black text-yellow-500 shadow-md shadow-[#ffd56cc3] flex items-center justify-center rounded-md"
        onClick={previous}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MdOutlineArrowBackIos className="w-6 h-6 md:w-8 md:h-8" />
      </motion.button>
      <motion.button
        className="w-16 md:w-20 h-16 md:h-20 text-black bg-yellow-500 shadow-md shadow-[#ffd56cc3] flex items-center justify-center rounded-md"
        onClick={next}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MdOutlineArrowForwardIos className="w-6 h-6 md:w-8 md:h-8" />
      </motion.button>
    </div>
  );
};

export default CarouselButton;
