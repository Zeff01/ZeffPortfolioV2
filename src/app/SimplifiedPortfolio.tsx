"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { skillsData, skillCategories } from "@/data/skillData";
import { projects, otherProjects } from "@/data/projectsData";
import { experienceData } from "@/data/experienceData";
import SmallArcReactor from "@/components/SmallArcReactor";
import emailjs from "@emailjs/browser";
import PuffLoader from "react-spinners/PuffLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AiOutlineMail,
  AiOutlineLinkedin,
  AiOutlineFacebook,
} from "react-icons/ai";

const SimplifiedPortfolio = ({ onClose }: { onClose: () => void }) => {
  const [activeSkillCategory, setActiveSkillCategory] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  // Filter skills based on active category
  const filteredSkills =
    activeSkillCategory === "all"
      ? skillsData
      : skillsData.filter((skill) => skill.category === activeSkillCategory);

  // Email functionality
  const successEmail = () =>
    toast.success("Your message was sent. Thank you for reaching out.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const errorEmail = () =>
    toast.error("An error occurred while sending your message.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    if (form.current) {
      emailjs
        .sendForm(
          "service_z1dd26g",
          "template_21yh8jj",
          form.current,
          "y42g9nykusHell-eu"
        )
        .then(
          (result) => {
            setIsSending(false);
            successEmail();
            (e.target as HTMLFormElement).reset();
          },
          (error) => {
            errorEmail();
            console.log(error.text);
          }
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-blackBackground z-50 overflow-y-auto font-tech"
    >
      <ToastContainer />

      {/* IRONMAN HOVER ANIMATION - Enhanced and positioned on left side */}
      <div className="hidden md:flex fixed left-0 lg:left-0 -top-20 bottom-0 h-screen pointer-events-none z-30 overflow-hidden w-16">
        <motion.div
          initial={{ y: "80vh", opacity: 0, scale: 1 }}
          animate={{
            y: 200,
            opacity: 1,
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            duration: 3,
            delay: 0.5,
          }}
          className="absolute left-0 z-30"
        >
          <Image
            src="/ironmanassets/Ironmanhover.png"
            alt="Ironman Hover"
            width={90}
            height={90}
            className="relative z-20"
          />
        </motion.div>

        {/* Teal Lines */}
        <motion.div
          className="flex gap-4 absolute bottom-0 left-1/2 transform -translate-x-1/2"
          initial={{ height: 0 }}
          animate={{ height: "70%" }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="w-1 bg-teal-500 rounded-full h-[100%] relative">
            {/* Pulsing dots on the lines */}
            <motion.div
              className="absolute w-3 h-3 bg-teal-400 rounded-full -left-1"
              initial={{ top: "100%" }}
              animate={{ top: "0%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="w-1 bg-teal-500 rounded-full h-[100%] relative">
            <motion.div
              className="absolute w-3 h-3 bg-teal-400 rounded-full -left-1"
              initial={{ top: "100%" }}
              animate={{ top: "0%" }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </div>
        </motion.div>

        {/* Flying particles around Iron Man */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 45,
              y: 240,
              opacity: 0,
              scale: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              x: 45 + Math.cos((i * Math.PI) / 4) * 30,
              y: 240 + Math.sin((i * Math.PI) / 4) * 30,
              opacity: [0, 0.7, 0],
              scale: Math.random() * 0.5 + 0.3,
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50"
          />
        ))}
      </div>

      {/* Toggle back button */}
      <div className="fixed bottom-20 right-5 md:right-10 z-50">
        <SmallArcReactor onClick={onClose} isSimplifiedView={true} />
      </div>

      <div className="container mx-auto px:8 md:px-16 py-16 max-w-6xl">
        {/* Header - No center image */}
        <header className="flex items-center gap-16 ">
          <div className=" mb-6 mx-4">
            <Image
              src="/zeffdp/zeffdp.jpg"
              alt="Zeff DP"
              width={180}
              height={180}
              className="rounded-full border-2 border-buttonColor"
            />
          </div>

          <div className="text-center mb-16">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-textColor mb-2"
            >
              Zeff
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 mb-4"
            >
              FullStack & Solidity Developer
            </motion.p>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-4"
            >
              <a
                href="https://github.com/Zeff01"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-textColor text-buttonColor px-4 py-2 rounded-full font-bold hover:bg-opacity-80 transition-all"
              >
                GitHub
              </a>
              <a
                href="/JzeffResume.pdf"
                download
                target="_blank"
                className="bg-buttonColor text-textColor px-4 py-2 rounded-full font-bold hover:bg-opacity-80 transition-all"
              >
                Download CV
              </a>
            </motion.div>
          </div>
        </header>

        {/* About Section */}
        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16 bg-zinc-900/50 rounded-2xl p-6 shadow-lg shadow-buttonColor/10"
        >
          <h2 className="text-2xl font-bold text-buttonColor mb-4">About Me</h2>
          <p className="text-gray-300 mb-4">
            I'm a passionate Full Stack Developer with experience in both
            frontend and backend technologies. My approach to technology is
            simple: it's about making things that work beautifully, both inside
            and out.
          </p>
          <p className="text-gray-300">
            Whether I'm debugging a back-end system or polishing a user
            interface, my goal is to create something that's not just
            functional, but also a joy to use. At the heart of it all, I'm a
            problem solver, a creative thinker, and a team player who believes
            in the power of collaboration.
          </p>
        </motion.section>

        {/* Projects Section - Work Projects First and Larger */}
        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-16 bg-zinc-900/50 rounded-2xl p-6 shadow-lg shadow-buttonColor/10"
        >
          <h2 className="text-2xl font-bold text-buttonColor mb-6">
            My Projects
          </h2>

          <h3 className="text-xl font-bold text-textColor mb-4">
            Work Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {otherProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 * Math.min(index, 10) }}
                className="bg-zinc-800 rounded-xl overflow-hidden hover:shadow-md hover:shadow-buttonColor/20 transition-all group h-full"
              >
                <div className="relative aspect-video">
                  <Image
                    src={project.url}
                    alt={`Project ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-textColor text-buttonColor px-3 py-1.5 rounded-lg text-sm font-medium inline-block hover:bg-opacity-80 transition-all"
                    >
                      Visit Project
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Not publicly available
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <h3 className="text-xl font-bold text-textColor mb-4">
            Self Made Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * Math.min(index, 6) }}
                className="bg-zinc-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-buttonColor/30 transition-all"
              >
                <div className="relative h-48">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-bold text-white mb-2">
                    {project.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-textColor text-buttonColor px-3 py-1.5 rounded-lg text-sm font-medium inline-block hover:bg-opacity-80 transition-all"
                  >
                    View Project
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Experience Section - All Experiences */}
        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-16 bg-zinc-900/50 rounded-2xl p-6 shadow-lg shadow-buttonColor/10"
        >
          <h2 className="text-2xl font-bold text-buttonColor mb-6">
            Work Experience
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experienceData.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + Math.min(index * 0.05, 1.5) }}
                className="border-l-2 border-buttonColor pl-4 py-2"
              >
                <h3 className="text-lg font-bold text-textColor">
                  {exp.position}
                </h3>
                <div className="flex flex-wrap items-center text-sm text-gray-400 mb-1">
                  <a
                    href={exp.companyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-textColor hover:underline mr-2"
                  >
                    @{exp.company}
                  </a>
                  <span>• {exp.time}</span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-3 hover:line-clamp-none transition-all duration-300">
                  {exp.work}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Skills Section */}
        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mb-16 bg-zinc-900/50 rounded-2xl p-6 shadow-lg shadow-buttonColor/10"
        >
          <h2 className="text-2xl font-bold text-buttonColor mb-6">
            My Skills
          </h2>

          {/* Skill Categories */}
          <div className="flex flex-wrap justify-center mb-6 gap-2">
            {skillCategories.map((category) => (
              <button
                key={category.id}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  activeSkillCategory === category.id
                    ? "bg-buttonColor text-white font-bold"
                    : "text-gray-300 bg-zinc-800 hover:bg-zinc-700"
                }`}
                onClick={() => setActiveSkillCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * (index % 8) }}
                className="flex flex-col items-center bg-[#480101] p-3 rounded-lg border border-[#a38332c7] hover:scale-105 transition-all"
              >
                <Image
                  src={skill.image}
                  alt={skill.title}
                  width={40}
                  height={40}
                  className="mb-2"
                />
                <span className="text-white text-xs text-center">
                  {skill.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Section - Integrated from your Contact component */}
        <motion.section
          id="contact"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-16 bg-zinc-900/50 rounded-2xl p-6 shadow-lg shadow-buttonColor/10"
        >
          <h2 className="text-2xl font-bold text-buttonColor mb-6 text-center">
            Let's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
              Connect
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-center mb-8">
            Have a project in mind? Let's create something amazing together.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Methods */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-zinc-900 p-6 rounded-xl hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-red-900/10 rounded-lg group-hover:bg-red-900/20 transition-colors">
                    <AiOutlineMail className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-semibold text-white">Email</h3>
                    <p className="text-white">Jzeffsomera@gmail.com</p>
                  </div>
                  <a
                    href="mailto:jzeffsomera@gmail.com"
                    className="px-4 py-2 bg-yellow-300/10 text-yellow-300 rounded-lg hover:bg-yellow-300/20 transition-colors whitespace-nowrap"
                  >
                    Send Email
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-zinc-900 p-6 rounded-xl hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-900/10 rounded-lg group-hover:bg-blue-900/20 transition-colors">
                    <AiOutlineLinkedin className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-semibold text-white">
                      LinkedIn
                    </h3>
                    <p className="text-white">Jzeff Somera</p>
                  </div>
                  <a
                    href="https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/"
                    target="_blank"
                    className="px-4 py-2 bg-yellow-300/10 text-yellow-300 rounded-lg hover:bg-yellow-300/20 transition-colors whitespace-nowrap"
                  >
                    Connect
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-zinc-900 p-6 rounded-xl hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-900/10 rounded-lg group-hover:bg-blue-900/20 transition-colors">
                    <AiOutlineFacebook className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-semibold text-white">
                      Facebook
                    </h3>
                    <p className="text-white">Zeff Somers</p>
                  </div>
                  <a
                    href="https://m.me/Jzironman"
                    target="_blank"
                    className="px-4 py-2 bg-yellow-300/10 text-yellow-300 rounded-lg hover:bg-yellow-300/20 transition-colors whitespace-nowrap"
                  >
                    Message
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="bg-zinc-900 p-8 rounded-xl"
            >
              <form ref={form} onSubmit={sendEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-300 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-300 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-300 transition-colors"
                    placeholder="Your message"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full px-6 py-3 bg-yellow-300 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
                >
                  {isSending ? (
                    <>
                      <PuffLoader color="#000000" size={24} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Let's Collaborate"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="text-center mt-12 mb-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <div className="relative py-10">
            {/* Arc Reactor in Footer */}
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-buttonColor rounded-full flex items-center justify-center relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 10px 2px rgba(255, 215, 0, 0.7)",
                      "0 0 20px 5px rgba(255, 215, 0, 0.9)",
                      "0 0 10px 2px rgba(255, 215, 0, 0.7)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center"
                >
                  <div className="w-4 h-4 bg-textColor rounded-full"></div>
                </motion.div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-10">
              <p className="text-textColor font-bold">
                © 2022 - {new Date().getFullYear()} Zeff. All rights reserved.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Powered by Iron Man Tech!
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
};

export default SimplifiedPortfolio;
