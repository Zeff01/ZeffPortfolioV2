"use client";
import React from "react";
import AnimatedNumbers from "@/hooks/AnimatedNumbers";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const socialMediaIcons = [
  { name: "github", icon: FaGithub, link: "https://github.com/Zeff01" },
  {
    name: "linkedin",
    icon: FaLinkedin,
    link: "https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/",
  },
  {
    name: "facebook",
    icon: FaFacebook,
    link: "https://www.facebook.com/Jzironman",
  },
  {
    name: "instagram",
    icon: FaInstagram,
    link: "https://www.instagram.com/zeffsomera/",
  },
  {
    name: "twitter",
    icon: FaTwitter,
    link: "https://twitter.com/jzeff_somera",
  },
];

const Footer = () => {
  return (
    <div>
      <div className="py-2 px-1 md:p-2 w-full bg-blackBackground text-white  ">
        <div>
          <motion.ul className="flex justify-center items-center gap-6  mb-2 md:mb-0 -z-10">
            {socialMediaIcons.map((socialMedia, index) => (
              <motion.li
                key={socialMedia.name}
                whileHover={{ scale: 1.2 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 2 + index * 0.2 }}
              >
                <a
                  className={`afooter ${socialMedia.name}`}
                  href={socialMedia.link}
                  target="_blank"
                >
                  <i>
                    <socialMedia.icon />
                  </i>
                  <i>
                    <socialMedia.icon />
                  </i>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
        <div className=" flex flex-col justify-center items-center px-1  md:p-2">
        
          <div
            className="text-xl  text-yellow-500  px-4 flex justify-center rounded-lg  pt-2 items-center"
          >
            <span className="mr-2 ">I LOVE YOU</span>
            <AnimatedNumbers value={3000} delayTimer={100} duration={8000} />
          </div>
          <h3 className="text-lg text-white font-Quicksand">
            Jzeff Kendrew Somera{" "}
            <span className="text-md text-[#ffffff]">©2022</span>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Footer;
