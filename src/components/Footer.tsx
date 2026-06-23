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
  FaHeart,
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
    <footer className="relative w-full overflow-hidden bg-transparent text-white font-tech">
      {/* subtle gold/red top divider (no glow) */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-textColor/40 to-transparent" />

      {/* ambient corner glows */}
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-buttonColor/20 blur-[110px]" />
      <div className="pointer-events-none absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-textColor/10 blur-[110px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 py-10 md:flex-row">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left"
        >
          <h3 className="bg-gradient-to-r from-textColor to-buttonColor bg-clip-text text-2xl font-bold text-transparent">
            Jzeff Kendrew Somera
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            AI Engineer · Fullstack &amp; Blockchain Developer
          </p>
        </motion.div>

        {/* I LOVE YOU 3000 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 rounded-full border border-textColor/20 bg-white/[0.03] px-5 py-2 text-lg text-textColor backdrop-blur"
        >
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-buttonColor"
          >
            <FaHeart />
          </motion.span>
          <span className="tracking-wide">I LOVE YOU</span>
          <span className="font-bold text-yellow-400">
            <AnimatedNumbers value={3000} />
          </span>
        </motion.div>

        {/* Socials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {socialMediaIcons.map((social) => (
            <motion.a
              key={social.name}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              whileHover={{ y: -4, scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              className="group grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-gray-300 backdrop-blur transition-all duration-300 hover:border-textColor/60 hover:text-textColor hover:shadow-[0_0_18px_rgba(246,174,42,0.45)]"
            >
              <social.icon className="text-lg" />
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* copyright bar */}
      <div className="border-t border-white/5 px-6 py-4 text-center text-xs text-gray-500">
        © 2022 Jzeff Kendrew Somera. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
