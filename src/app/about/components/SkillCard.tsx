import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { StaticImageData } from "next/image";

interface SkillCardType {
  image: StaticImageData;
  title: string;
  link: string;
}

const SkillCard = ({ image, title, link }: SkillCardType) => {
  const item = {
    hidden: {
      opacity: 0,
      x: "-100vw",
    },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        mass: 1,
        damping: 30,
        stiffness: 100,
        velocity: 1000,
      },
    },
  };

  return (
    <div>
      <a href={link} target="_blank">
        <motion.div
          className="border-t border-[#a38332c7] rounded-xl shadow-md shadow-[#ffd56cc3] 
   p-1 md:px-4 md:py-2 whitespace-nowrap flex flex-col justify-center items-center bg-[#480101]"
          whileHover={{ scale: 1.1 }}
          variants={item}
        >
          <Image
            className="mx-auto md:w-[100px] md:h-[100px] w-[60px] h-[60px]"
            src={image}
            alt="HTML icon"
            width={60}
            height={60}
          />
          <motion.h1 className="text-white font-bold text-xs md:text-2xl mt-2">
            {title}
          </motion.h1>
        </motion.div>
      </a>
    </div>
  );
};

export default SkillCard;
