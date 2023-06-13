import ArcReactor from "@/components/ArcReactor";
import Carousel from "@/app/projects/components/Carousel";
import Navbar from "@/components/Navbar";
import TransitionEffect from "@/hooks/TransitionEffect";
import React from "react";
import Footer from "@/components/Footer";

const Projects = () => {
  return (
    <div className="h-full min-h-screen  bg-[#0c0a0a] overflow-x-hidden  relative">
      <Navbar />
      <TransitionEffect />
      <div className="h-full relative mt-28">
        <Carousel />
      </div>
      <ArcReactor />
      <Footer />
    </div>
  );
};

export default Projects;
