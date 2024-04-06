"use client";

import TransitionEffect from "@/hooks/TransitionEffect";
import React, { useEffect, useRef, useState } from "react";
import {
  projects,
  thumbnailData,
  mobileProjects,
  otherProjects,
} from "@/data/projectsData";
import SelfMadeProjects from "./components/SelfMadeProjects";
import Thumbnail from "./components/Thumbnail";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
import CollaborativeProjects from "./components/CollaborativeProjects";
import MobileProjects from "./components/MobileProjects";

interface CustomButtonProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

const Projects = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const mainSlider = useRef<Slider | null>(null);
  const thumbnailSlider = useRef<Slider | null>(null);
  const collaborativeSliderRef = useRef<Slider | null>(null);
  const mobileSliderRef = useRef<Slider | null>(null);

  useEffect(() => {
    thumbnailSlider.current?.slickGoTo(currentSlide);
  }, [currentSlide]);

  const CustomNextButton: React.FC<CustomButtonProps> = ({ onClick }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          delay: 3.2,
        }}
        onClick={onClick}
        className=" absolute bottom-0 right-0 transform -translate-x-1/2 -translate-y-1/2  z-90 bg-yellow-300 rounded-full z-90"
      >
        <MdOutlineNavigateNext size={40} color="red" />
      </motion.div>
    );
  };

  const CustomPrevButton: React.FC<CustomButtonProps> = ({ onClick }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          delay: 3.2,
        }}
        onClick={onClick}
        className=" absolute bottom-0 left-0 transform -translate-x-1/2 -translate-y-1/2  z-90 bg-yellow-300 rounded-full z-90"
      >
        <MdOutlineNavigateBefore size={40} color="red" />
      </motion.div>
    );
  };

  const mainSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
    },
    nextArrow: (
      <CustomNextButton onClick={() => mainSlider.current?.slickNext()} />
    ),
    prevArrow: (
      <CustomPrevButton onClick={() => mainSlider.current?.slickPrev()} />
    ),
  };

  const thumbnailSettings = {
    vertical: true,
    verticalSwiping: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <></>,
    prevArrow: <></>,
    responsive: [
      {
        breakpoint: 768, // Tailwind's 'md' breakpoint
        settings: {
          vertical: false,
          verticalSwiping: false,
          slidesToShow: 2, // Adjust based on your design needs
          slidesToScroll: 1,
          adaptiveHeight: true,
          swipeToSlide: true,
        },
      },
    ],
  };

  const collaborativeSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    adaptiveHeight: false,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: (
      <CustomNextButton
        onClick={() => collaborativeSliderRef.current?.slickNext()}
      />
    ),
    prevArrow: (
      <CustomPrevButton
        onClick={() => collaborativeSliderRef.current?.slickPrev()}
      />
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const mobileSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    adaptiveHeight: false,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: (
      <CustomNextButton onClick={() => mobileSliderRef.current?.slickNext()} />
    ),
    prevArrow: (
      <CustomPrevButton onClick={() => mobileSliderRef.current?.slickPrev()} />
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <div className="h-full   bg-blackBackground overflow-x-hidden  relative ">
      <TransitionEffect />
      <div className="flex flex-col md:flex-row  md:flex-wrap">
        <div className="md:w-4/5  text-white p-8  ">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              delay: 2.8,
            }}
            className="text-lg"
          >
            SELF - MADE PROJECTS
          </motion.h1>
          <Slider ref={mainSlider} {...mainSettings}>
            {projects.map((project) => (
              <SelfMadeProjects
                key={project.id}
                title={project.title}
                description={project.description}
                imageUrl={project.imageUrl}
                alt={project.alt}
                ratings={project.ratings}
                techIcons={project.techIcons}
                projectUrl={project.projectUrl}
                previewUrl={project.previewUrl}
              />
            ))}
          </Slider>
        </div>
        <div className="md:w-1/5   text-white p-8 ">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              delay: 3,
            }}
            className="text-lg mb-4 white"
          >
            PREVIEW PANEL
          </motion.h1>
          <div className=" h-full">
            <Slider ref={thumbnailSlider} {...thumbnailSettings}>
              {thumbnailData.map((thumbnail, index) => (
                <motion.div
                  key={thumbnail.id}
                  animate={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: 2.8 + index * 0.1 }}
                >
                  <Thumbnail thumbnail={thumbnail} />
                </motion.div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col ">
        <div className="w-full text-white p-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              delay: 2.8,
            }}
            className="text-xl"
          >
            COLLABORATIVE PROJECTS
          </motion.h1>
          <Slider ref={collaborativeSliderRef} {...collaborativeSettings}>
            {otherProjects.map((item, index) => (
              <CollaborativeProjects item={item} index={index} />
            ))}
          </Slider>
        </div>
        <div className="w-full  text-white p-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              delay: 2.8,
            }}
            className="text-xl"
          >
            MOBILE PROJECTS
          </motion.h1>
          <Slider ref={mobileSliderRef} {...mobileSettings}>
            {mobileProjects.map((mobileImg, index) => (
              <MobileProjects mobileImg={mobileImg} index={index} />
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Projects;
