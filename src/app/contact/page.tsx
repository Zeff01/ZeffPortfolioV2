import ArcReactor from "@/components/ArcReactor";
import Navbar from "@/components/Navbar";
import TransitionEffect from "@/hooks/TransitionEffect";
import React from "react";

const Contact = () => {
  return (
    <div className="h-full min-h-screen  bg-[#0c0a0a] overflow-x-hidden  relative">
      <Navbar />
      <TransitionEffect />
      <ArcReactor />
    </div>
  );
};

export default Contact;
