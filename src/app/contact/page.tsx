"use client";

import Navbar from "@/components/Navbar";
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
    } else {
      console.error("Form reference is null");
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
    <div className="h-full min-h-screen  bg-[#0c0a0a] overflow-hidden  relative ">
      <TransitionEffect />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ToastContainer />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="  h-full  flex flex-col gap-2 md:p-8 mt-16 md:mt-0 "
      >
        <motion.h2
          variants={itemVariants}
          className="text-textColor text-2xl md:text-4xl p-2 "
        >
          Let's Connect
        </motion.h2>
        <motion.div
          variants={itemVariants}
          className=" flex md:flex-row flex-col-reverse w-full bg-[#0f0d0d] p-4  "
        >
          <div className=" w-full  ">
            <div className="flex flex-col justify-center w-full h-full p-4  ">
              <div className="flex flex-col items-center w-full ">
                <div className="flex md:flex-col lg:grid  gap-4 w-full  ">
                  <div className="w-full rounded-md p-2 md:p-4 lg:p-8 flex flex-col md:flex-row justify-center md:justify-start items-center border my-1 md:my-4 md:mx-2 lg:mx-0">
                    <AiOutlineMail className="w-[40px] h-[40px] mr-4 text-[#bb001b]" />

                    {/* Hide on small screens */}
                    <div className="hidden md:flex flex-col text-textColor">
                      <h2>Email</h2>
                      <span>Jzeffsomera@gmail.com</span>
                    </div>

                    {/* Visible on all screen sizes */}
                    <a
                      href="mailto:jzeffsomera@gmail.com"
                      target="_blank"
                      className="font-bold text-[#ddd5d5] hover:text-[#fff] mt-4 md:mt-0 md:ml-4"
                    >
                      Send a Message
                    </a>
                  </div>

                  <div className="w-full rounded-md p-2 flex flex-col justify-center md:justify-start items-center border my-1 md:flex-row md:my-4 md:mx-2 lg:mx-0 lg:p-8">
                    <AiOutlineLinkedin className="w-[40px] h-[40px] mr-4 text-[#0077b5]" />

                    {/* Hide on small screens */}
                    <div className="hidden md:flex flex-col text-textColor">
                      <h2>LinkedIn</h2>
                      <span>Jzeff Somera</span>
                    </div>

                    {/* Visible on all screen sizes */}
                    <a
                      href="https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/"
                      target="_blank"
                      className="font-bold text-[#ddd5d5] hover:text-[#fff] mt-4 md:mt-0 md:ml-4"
                    >
                      Send a Message
                    </a>
                  </div>

                  <div className="w-full rounded-md p-2 flex flex-col justify-center md:justify-start items-center border my-1 md:flex-row md:my-4 md:mx-2 lg:mx-0 lg:p-8">
                    <AiOutlineFacebook className="w-[40px] h-[40px] mr-4 text-[#1877f2]" />

                    {/* Hide on small screens */}
                    <div className="hidden md:flex flex-col justify-center text-textColor">
                      <h2>Facebook</h2>
                      <span>Zeff Somers</span>
                    </div>

                    {/* Visible on all screen sizes */}
                    <a
                      href="https://m.me/Jzironman"
                      target="_blank"
                      className="font-bold text-[#ddd5d5] hover:text-[#fff] mt-4 md:mt-0 md:ml-4"
                    >
                      Send a Message
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" w-full flex items-center ">
            <div className="  w-full  flex items-center">
              <form
                ref={form}
                onSubmit={sendEmail}
                className="w-full md:p-4 mt-2 md:mt-0"
              >
                <fieldset disabled={isSending} className="flex flex-col">
                  <h1 className="text-white text-2xl mb-8">Send me an email</h1>

                  {/* Name */}
                  <label htmlFor="name" className="text-white font-medium mb-2">
                    Name
                  </label>
                  <motion.input
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 3.3 }}
                    className="bg-[#0f0d0d] p-4 rounded-sm outline-[#cfcc07]"
                    type="text"
                    placeholder="Zeff"
                    name="name"
                    id="name" // Corresponds to the label's htmlFor
                    required
                  />

                  {/* Email */}
                  <label
                    htmlFor="email"
                    className="text-white font-medium mb-2 mt-4"
                  >
                    Email
                  </label>
                  <motion.input
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 3.3 }}
                    className="p-4 bg-[#0f0d0d] rounded-sm outline-[#cfcc07]"
                    type="email"
                    placeholder="JzeffSomera@gmail.com"
                    name="email"
                    id="email" // Corresponds to the label's htmlFor
                    required
                  />

                  {/* Message */}
                  <label
                    htmlFor="message"
                    className="text-white font-medium mb-2 mt-4"
                  >
                    Message
                  </label>
                  <motion.textarea
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 10,
                      delay: 3.3,
                    }}
                    className="bg-[#0f0d0d] p-4 rounded-sm outline-[#cfcc07]"
                    name="message"
                    id="message" // Corresponds to the label's htmlFor
                    rows={5}
                    placeholder="Your message here"
                    required
                  ></motion.textarea>

                  <div className="flex">
                    <motion.button
                      className="text-white font-bold rounded-lg hover:text-[#cb0d0d] hover:rounded-md hover:border p-4 my-8 bg-buttonColor"
                      whileHover={{ scale: 1.1, backgroundColor: "#f1ee24" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {!isSending && "Let's Collaborate"}
                      {isSending && (
                        <>
                          Sending...
                          <PuffLoader color="#e10707" size={24} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contact;
