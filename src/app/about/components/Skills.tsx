import React, { useState } from "react";
import { motion } from "framer-motion";
import SkillCard from "./SkillCard";
import { skillsData, skillCategories } from "@/data/skillData";

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Slightly slower stagger for more natural feel
        delayChildren: 0.2,
        duration: 0.6,
      },
    },
  };

  // Filter skills based on active category
  const filteredSkills =
    activeCategory === "all"
      ? skillsData
      : skillsData.filter((skill) => skill.category === activeCategory);

  return (
    <div className="w-full font-tech">
      <div className="flex flex-col justify-center items-center text-titleColor w-full mt-10 mb-6">
        <motion.h2
          className="text-buttonColor text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }} // Smoother animation
        >
          S<span className="text-textColor">kills</span>
        </motion.h2>
        <motion.p
          className="text-textColor text-base sm:text-lg mt-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }} // Smoother animation
        >
          Here are the technologies I've worked with
        </motion.p>
      </div>

      {/* Category Tabs */}
      <motion.div
        className="flex justify-center mb-8 mt-6 px-2"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
      >
        <div className="bg-[#280000] rounded-full p-1 flex flex-wrap justify-center max-w-[90%] md:max-w-3xl">
          {skillCategories.map((category, index) => (
            <motion.button
              key={category.id}
              className={`px-2 sm:px-3 py-1 text-xs md:text-sm rounded-full m-1 transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-buttonColor text-white font-bold"
                  : "text-gray-300 hover:bg-[#3a0101]"
              }`}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="w-full p-2 sm:p-4 flex justify-center">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full max-w-4xl mx-auto"
          style={{ gridAutoRows: "1fr" }}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          key={activeCategory} // Re-render animation when category changes
        >
          {filteredSkills.map((skill) => (
            <SkillCard
              key={`${activeCategory}-${skill.title}`}
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
