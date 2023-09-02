import React, { useRef } from "react";
import { useScroll, motion } from "framer-motion";
import LiAnimation from "./LiAnimation";
import { experienceData } from "@/data/experienceData";

const Experience = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });

  return (
    <div className="my-64   border-red-500 font-tech text-white">
      <motion.h2
        className="font-bold text-6xl md:text-8xl mb-32 text-center text-textColor"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0 }}
      >
        <span className="text-buttonColor">E</span>xperience
      </motion.h2>

      <div ref={ref} className="md:w-[75%] mx-auto relative h-full  ">
        <motion.div
          className="absolute left-9 top-0 w-[4px] h-full bg-cyan-500 origin-top shadow-xl "
          style={{
            scaleY: scrollYProgress,
            boxShadow: "0px 8px 20px 2px rgb(10,252,252)", // Add shadow effect
          }}
        />

        <ul className="w-full flex flex-col items-start justify-between ml-4">
          {experienceData.map((exp) => (
            <LiAnimation
              key={exp.company}
              position={exp.position}
              company={exp.company}
              companyLink={exp.companyLink}
              time={exp.time}
              address={exp.address}
              work={exp.work}
            />
          ))}

          <motion.h2
            className="font-bold text-6xl my-32  text-center  mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0 }}
          >
            Education
          </motion.h2>
          <LiAnimation
            position="Bachelor of Science In Information
            Technology and Service Management"
            company="University of Makati"
            companyLink="https://www.umak.edu.ph/"
            time="2017-2021"
            address="Makati, Philippines"
            work=""
          />
        </ul>
      </div>
    </div>
  );
};

export default Experience;
