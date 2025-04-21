import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { StaticImageData } from "next/image";

interface SkillCardProps {
  image: StaticImageData;
  title: string;
  link: string;
}

const SkillCard = ({ image, title, link }: SkillCardProps) => {
  const item = {
    hidden: {
      opacity: 0,
      y: 20,
      x: 0,
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        mass: 1,
        damping: 18,
        stiffness: 100,
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div variants={item}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <motion.div
          className="border border-[#a38332c7] rounded-lg sm:rounded-2xl shadow-lg shadow-[#ffd56cc3] 
          p-2 sm:p-3 md:p-4 flex flex-col justify-center items-center bg-[#480101] transition-all aspect-square"
          whileHover={{
            scale: 1.05,
            rotate: 2,
            boxShadow: "0px 0px 12px 2px rgba(255, 213, 108, 0.8)",
            transition: { duration: 0.35 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-center items-center w-full h-[60%]">
            <Image
              className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] lg:w-[70px] lg:h-[70px] object-contain"
              src={image}
              alt={`${title} icon`}
              width={60}
              height={60}
            />
          </div>
          <h3 className="text-white font-bold text-[10px] sm:text-xs md:text-sm lg:text-base mt-1 md:mt-2 text-center truncate w-full">
            {title}
          </h3>
        </motion.div>
      </a>
    </motion.div>
  );
};

export default SkillCard;
