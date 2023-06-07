import React, { useRef } from "react";
import { useScroll, motion } from "framer-motion";
import LiAnimation from "./LiAnimation";

const Experience = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });

  return (
    <div className="my-64   border-red-500 font-tech">
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
          <LiAnimation
            position="Front End Developer"
            company="HookSales"
            companyLink=""
            time="2023 - PRESENT"
            address="California, USA"
            work="
            Experienced in designing and developing diverse UI/UX elements and functionalities using Next.js, catering to specific client requirements. Proficient in translating client requests into innovative and visually appealing designs, while ensuring seamless functionality. Demonstrated ability to effectively collaborate with clients to deliver customized solutions that meet their unique needs."
          />
          <LiAnimation
            position="Front End Developer"
            company="Xurpas"
            companyLink="https://xurpasgroup.com/"
            time="2022-2023"
            address="Makati, Philippines"
            work="As a Front-End Developer, I specialize in using React, React Native, and Angular. I have been deployed on various projects including LMX, Misorobotics, Memachat app, Playfriends, and Lexi. Additionally, I am also involved in Solidity research and development."
          />
          <LiAnimation
            position="Front End Developer"
            company="Red Sky Digital Co,. Ltd."
            companyLink="https://redskydigital.com/"
            time="2023"
            address="Bangkok, Thailand"
            work="I completed diverse tasks for Agoda, demonstrating creativity and meticulous attention to detail. Additionally, I contributed to WordPress website development and maintenance, showcasing proficiency in the platform. I also successfully developed EquitySwarm using React, highlighting my expertise in front-end development and commitment to delivering exceptional user experiences."
          />
          <LiAnimation
            position="Front End Developer"
            company="Outposter"
            companyLink="https://outposter.com.au/"
            time="2023 - PRESENT"
            address="Makati, Philippines"
            work="I provided assistance in maintaining and enhancing a real estate business website built in REX CMS, ensuring optimal user experience and smooth operation. Additionally, I developed the Hodge Social website, demonstrating my proficiency in web development and delivering an engaging online presence."
          />
          <LiAnimation
            position="Full Stack Developer"
            company="SimplFulfillment"
            companyLink="https://www.simplfulfillment.com/"
            time="2023"
            address="California, USA"
            work="
            I independently expanded and improved an existing project using Next.js, ensuring smooth transitions and development. I addressed issues on both the admin and client sides, enhancing functionality and user satisfaction. Additionally, I utilized Prisma for efficient backend operations and spearheaded a comprehensive app redesign that prioritized creativity and intuitive UX/UI principles."
          />

          <LiAnimation
            position="Mobile Developer"
            company="Sibs"
            companyLink="https://sibs-app.com/"
            time="2023"
            address="California, USA"
            work="I am building a social bartering system using React Native, showcasing my expertise in mobile app development. The system utilizes Firebase for efficient and reliable data management, while Agile methodology is implemented to drive iterative progress and continuous improvement. Working within a fast-paced team environment, I am focused on delivering the social bartering system effectively."
          />

          <LiAnimation
            position="Mobile Developer"
            company="NOAH Business application"
            companyLink="https://noahapplication.com/"
            time="2021-2022"
            address="Makati, Philippines"
            work="
            As the sole React Native Developer in the Research and Development team, I maintained a well-structured and clean codebase, adhering to standardized functions and design principles. I facilitated collaboration and ensured consistent quality in mobile development within the organization, integrating mobile APIs for seamless connectivity and creating comprehensive documentation for knowledge transfer and reference."
          />

          <LiAnimation
            position="Full Stack Developer Intern"
            company="NOAH Business application"
            companyLink="https://noahapplication.com/"
            time="2021-2022"
            address="Makati, Philippines"
            work="
            As a Full Stack Developer Intern, I actively contributed to a Research and Development team, focusing on building a robust web portal with seamless integration to a dynamic database. I also designed and developed a React Native mobile app with unique features for improved usability. Throughout my internship, I emphasized the importance of comprehensive documentation to support the company's future endeavors."
          />
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
