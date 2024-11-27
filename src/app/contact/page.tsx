"use client";

import TransitionEffect from "@/hooks/TransitionEffect";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import PuffLoader from "react-spinners/PuffLoader";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AiOutlineMail,
  AiOutlineLinkedin,
  AiOutlineFacebook,
} from "react-icons/ai";

const Contact = () => {
  const [isSending, setIsSending] = useState(false);
  const form = useRef<HTMLFormElement>(null);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
        delayChildren: 2.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-blackBackground text-white px-4 sm:px-8 md:px-12 py-24 overflow-hidden">
      <TransitionEffect />
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Let's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
              Connect
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have a project in mind? Let's create something amazing together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="bg-zinc-900 p-6 rounded-xl hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-900/10 rounded-lg group-hover:bg-red-900/20 transition-colors">
                  <AiOutlineMail className="w-6 h-6 text-red-500" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-gray-400">Jzeffsomera@gmail.com</p>
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
              variants={itemVariants}
              className="bg-zinc-900 p-6 rounded-xl hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/10 rounded-lg group-hover:bg-blue-900/20 transition-colors">
                  <AiOutlineLinkedin className="w-6 h-6 text-blue-500" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-semibold">LinkedIn</h3>
                  <p className="text-gray-400">Jzeff Somera</p>
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
              variants={itemVariants}
              className="bg-zinc-900 p-6 rounded-xl hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/10 rounded-lg group-hover:bg-blue-900/20 transition-colors">
                  <AiOutlineFacebook className="w-6 h-6 text-blue-500" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-semibold">Facebook</h3>
                  <p className="text-gray-400">Zeff Somers</p>
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
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-zinc-900 p-8 rounded-xl"
          >
            <form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
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
                <label className="block text-sm font-medium text-gray-400 mb-2">
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
                <label className="block text-sm font-medium text-gray-400 mb-2">
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
      </div>
    </div>
  );
};

export default Contact;
