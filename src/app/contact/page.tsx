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

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);

    emailjs
      .sendForm(
        "service_z1dd26g",
        "template_21yh8jj",
        form?.current,
        "y42g9nykusHell-eu"
      )
      .then(
        (result) => {
          setIsSending(false);
          successEmail();
          e.target.reset();
        },
        (error) => {
          errorEmail();
          console.log(error.text);
        }
      );
  };
  return (
    <div className="h-full min-h-screen  bg-[#0c0a0a] overflow-x-hidden  relative">
      <Navbar />
      <TransitionEffect />
      <div className=" max-w-[1000px] h-full mx-auto flex flex-col  items-center justify-between  ">
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

        <div className="flex justify-center ">
          <h2 className="text-textColor text-2xl md:text-4xl p-2">
            Let's Connect
          </h2>
        </div>
        <div className="lg:grid lg:grid-cols-2 gap-4 flex flex-col justify-center w-full h-full p-8 ">
          <div className="flex flex-col items-center w-full ">
            <div className="flex flex-col lg:grid  w-full md:flex-row  ">
              <div className="w-full rounded-md p-2 md:p-4 lg:p-8 flex justify-start items-center shadow-md shadow-[#eaf36b] bg-[#330d06] my-1 md:my-4 md:mx-2 lg:mx-0 ">
                <AiOutlineMail className="w-[40px] h-[40px] mr-4 text-[#bb001b]" />
                <div className="flex flex-col  text-textColor">
                  <h2>Email</h2>
                  <span>Jzeffsomera@gmail.com</span>
                  <a
                    href="Mailto:jzeffsomera@gmail.com"
                    target="_blank"
                    className="font-bold text-[#ddd5d5] hover:text-[#fff]"
                  >
                    Send a Message
                  </a>
                </div>
              </div>

              <div className="w-full rounded-md p-2 md:p-4 lg:p-8 flex justify-start items-center shadow-md shadow-[#eaf36b] bg-[#330d06] my-1 md:my-4 md:mx-2 lg:mx-0">
                <AiOutlineLinkedin className="w-[40px] h-[40px] mr-4 text-[#0077b5]" />
                <div className="flex flex-col  text-textColor">
                  <h2>Linked In</h2>
                  <span>Jzeff Somera</span>
                  <a
                    href="https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/"
                    target="_blank"
                    className="font-bold text-[#ddd5d5] hover:text-[#fff]"
                  >
                    Send a Message
                  </a>
                </div>
              </div>
              <div className="w-full rounded-md p-2 md:p-4 lg:p-8 flex justify-start items-center shadow-md shadow-[#eaf36b] bg-[#330d06]  my-1 md:my-4  md:mx-2 lg:mx-0">
                <AiOutlineFacebook className="w-[40px] h-[40px] mr-4 text-[#1877f2]" />
                <div className="flex flex-col justify-center text-textColor">
                  <h2>Facebook</h2>
                  <span>Zeff Somers</span>
                  <a
                    href="https://m.me/Jzironman"
                    target="_blank"
                    className="font-bold text-[#ddd5d5] hover:text-[#fff]"
                  >
                    {" "}
                    Send a Message
                  </a>
                </div>
              </div>
            </div>
          </div>
          <form
            ref={form}
            onSubmit={sendEmail}
            className="w-full md:p-4 
             mt-2 md:mt-0 "
          >
            <fieldset disabled={isSending} className="flex flex-col ">
              <input
                className="bg-[#e3e7f4] p-2 rounded-sm outline-[#cfcc07]"
                type="text"
                placeholder="Name"
                name="name"
                required
              />
              <input
                className="my-4 p-2 bg-[#e3e7f4] rounded-sm outline-[#cfcc07]"
                type="email"
                placeholder="Email"
                name="email"
                required
              />
              <textarea
                className="bg-[#e3e7f4] p-2 rounded-sm outline-[#cfcc07]"
                name="message"
                rows={5}
                placeholder="Message"
                required
              ></textarea>
              <div className="flex md:flex">
                <motion.button
                  className="text-textColor font-bold  border-t rounded-lg border-[#cdc55d] hover:text-[#cb0d0d] hover:rounded-md hover:border p-2 md:p-6 my-8 mx-auto shadow-md shadow-[#eaf36b] bg-buttonColor"
                  whileHover={{ scale: 1.1, backgroundColor: "#f1ee24" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {!isSending && "Let's Collaborate"}
                  {isSending && (
                    <>
                      Sending...
                      <PuffLoader color="#e10707" />
                    </>
                  )}
                </motion.button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
