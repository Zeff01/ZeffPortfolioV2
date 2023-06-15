import Carousel from "@/app/projects/components/Carousel";
import TransitionEffect from "@/hooks/TransitionEffect";
import React from "react";

const Projects = () => {
  return (
    <div className="min-h-screen h-full   bg-blackBackground overflow-x-hidden  relative">
      <TransitionEffect />
      <div className="h-full relative md:mt-28">
        <Carousel />
      </div>
    </div>
  );
};

export default Projects;
