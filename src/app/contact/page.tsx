"use client";

import TransitionEffect from "@/hooks/TransitionEffect";
import React from "react";
import PuffLoader from "react-spinners/PuffLoader";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AiOutlineMail,
  AiOutlineLinkedin,
  AiOutlineFacebook,
} from "react-icons/ai";
import { useEmailJS } from "@/hooks/useEmailJS";

const contactMethods = [
  {
    icon: AiOutlineMail,
    label: "Email",
    value: "Jzeffsomera@gmail.com",
    action: "Send Email",
    href: "mailto:jzeffsomera@gmail.com",
    external: false,
    accent: "text-red-500",
    glow: "hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.22)]",
    iconBg: "bg-red-900/20",
  },
  {
    icon: AiOutlineLinkedin,
    label: "LinkedIn",
    value: "Jzeff Somera",
    action: "Connect",
    href: "https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/",
    external: true,
    accent: "text-blue-400",
    glow: "hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(96,165,250,0.22)]",
    iconBg: "bg-blue-900/20",
  },
  {
    icon: AiOutlineFacebook,
    label: "Facebook",
    value: "Zeff Somers",
    action: "Message",
    href: "https://m.me/Jzironman",
    external: true,
    accent: "text-blue-500",
    glow: "hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.22)]",
    iconBg: "bg-blue-900/20",
  },
];

const Contact = () => {
  const { form, isSending, sendEmail } = useEmailJS();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-gray-500 backdrop-blur transition-all duration-300 focus:border-yellow-300/70 focus:bg-white/[0.06] focus:outline-none focus:shadow-[0_0_18px_rgba(246,174,42,0.18)]";

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-24 text-white sm:px-8 md:px-12">
      <TransitionEffect />
      <ToastContainer />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-buttonColor/20 blur-[130px]" />
        <div className="absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-textColor/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center sm:mb-20"
        >
          <span className="mb-4 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
            Get in touch
          </span>
          <h1 className="font-tech text-4xl font-bold md:text-6xl">
            Let's{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Connect
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Have a project in mind? Let's create something amazing together.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Methods */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {contactMethods.map((m) => (
              <motion.div
                key={m.label}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className={`group rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-all duration-300 ${m.glow}`}
              >
                <div className="flex items-center">
                  <div className={`rounded-lg p-3 ${m.iconBg}`}>
                    <m.icon className={`h-6 w-6 ${m.accent}`} />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-semibold">{m.label}</h3>
                    <p className="text-gray-400">{m.value}</p>
                  </div>
                  <a
                    href={m.href}
                    target={m.external ? "_blank" : undefined}
                    rel={m.external ? "noopener noreferrer" : undefined}
                    className="whitespace-nowrap rounded-lg bg-yellow-300/10 px-4 py-2 text-yellow-300 transition-colors hover:bg-yellow-300/20"
                  >
                    {m.action}
                  </a>
                </div>
              </motion.div>
            ))}

            {/* availability note */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.04] p-5 backdrop-blur"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>
              <p className="text-sm text-gray-300">
                Currently available for freelance & collaborations.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur shadow-xl shadow-black/30"
          >
            <form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className={inputClass}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className={`${inputClass} resize-none`}
                  placeholder="Your message"
                ></textarea>
              </div>

              <motion.button
                type="submit"
                disabled={isSending}
                whileHover={{ scale: isSending ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-500 px-6 py-3 font-bold text-black transition-all hover:shadow-[0_0_25px_rgba(246,174,42,0.4)] disabled:opacity-70"
              >
                {isSending ? (
                  <>
                    <PuffLoader color="#000000" size={24} />
                    <span>Sending...</span>
                  </>
                ) : (
                  "Let's Collaborate"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
