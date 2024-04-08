import React from "react";
import { motion } from "framer-motion";
import SkillCard from "./SkillCard";
import { skillsData } from "@/data/skillData";

const Skills = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        mass: 2,
        stiffness: 1000,
        velocity: 200,
      },
    },
  };
  return (
    <div className=" w-full font-tech ">
      <div className="flex flex-col justify-center items-center text-titleColor  w-full text-xl mt-8">
        <motion.h2
          className=" text-buttonColor text-6xl md:text-8xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          S<span className="text-textColor">kills</span>
        </motion.h2>
        <motion.p
          className="text-textColor text-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.2 }}
        >
          Here are the technologies I've worked with
        </motion.p>
      </div>

      <div className="flex w-full p-4 justify-center mt-6">
        <motion.div
          className="grid grid-cols-3 md:grid-cols-4  gap-4 md:gap-8 w-full "
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.8 }}
        >
          {skillsData.map((skill) => (
            <SkillCard
              key={skill.title}
              image={skill.image}
              title={skill.title}
              link={skill.link}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Skills;
