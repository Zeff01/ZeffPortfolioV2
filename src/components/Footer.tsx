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
  { icon: FaGithub, link: "https://github.com/Zeff01" },
  {
    icon: FaLinkedin,
    link: "https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/",
  },
  { icon: FaFacebook, link: "https://www.facebook.com/Jzironman" },
  { icon: FaInstagram, link: "https://www.instagram.com/zeffsomera/" },
  { icon: FaTwitter, link: "https://twitter.com/jzeff_somera" },
];

const Footer = () => {
  return (
    <div>
      <div className=" md:p-4 w-full bg-[#170704] text-white  ">
        <div>
          <motion.ul className="flex justify-center items-center gap-8 -z-10">
            {socialMediaIcons.map((socialMedia, index) => (
              <motion.li
                key={index}
                whileHover={{ scale: 1.2 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 2 + index * 0.2 }}
              >
                <a
                  className={`afooter ${socialMedia.icon}`}
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
        <div className=" flex flex-col justify-center items-center p-4">
          <h3 className="text-md text-[#dcb834] font-Quicksand hover:text-[#ffd43a] cursor-pointer">
            Jzeff Kendrew Somera{" "}
            <span className="text-sm text-[#ffffff]">©2022</span>
          </h3>
          <div
            className="text-4xl text-yellow-500  w-full flex justify-center rounded-lg mt-2 py-2"
            style={{
              boxShadow: "0px 8px 10px 2px #5B0000", // Add shadow effect
            }}
          >
            <span className="mr-4 ">I LOVE YOU</span>
            <AnimatedNumbers value={3000} delayTimer={100} duration={8000} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
