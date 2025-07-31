"use client";
import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CarouselItem from "./CarouselItem";
import { motion } from "framer-motion";

import {
  projects,
  thumbnailData,
  mobileProjects,
  workProjects,
} from "@/data/projectsData";
import Image from "next/image";
import CarouselButton from "./CarouselButton";
import Link from "next/link";

const Carousel = () => {
  const sliderRef = useRef<Slider>(null);
  const thumbnailRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    sliderRef.current?.slickGoTo(index);
    thumbnailRef.current?.slickGoTo(index);
  };

  const previous = () => {
    if (currentSlide !== undefined) {
      goToSlide(currentSlide - 1);
    }
  };

  const next = () => {
    if (currentSlide !== undefined) {
      goToSlide(currentSlide + 1);
    }
  };

  const settings = {
    dots: false,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <></>,
    prevArrow: <></>,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
      goToSlide(next);
    },
  };

  const thumbnailSettings = {
    dots: false,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    speed: 1500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <></>,
    prevArrow: <></>,
    afterChange: (current: number) => {
      setCurrentSlide(current);
      goToSlide(current);
    },
    responsive: [
      {
        breakpoint: 750,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const mobileSettings = {
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    cssEase: "linear",
    arrows: false,
    responsive: [
      {
        breakpoint: 750,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const workProjectsSettings = {
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    slidesToShow: 2,
    className: "center",
    centerMode: true,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
          centerMode: true,
        },
      },
    ],
  };

  return (
    <div className="mx-1 md:mx-8 relative flex flex-col gap-4  overflow-hidden mt-20 md:mt-0">
      <motion.p
        animate={{
          opacity: 1,
          scale: 1,
        }}
        initial={{
          opacity: 0,
          scale: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 3,
        }}
        className=" md:flex text-textColor text-2xl ml-2"
      >
        Self Made Projects
      </motion.p>
      {/* MAIN CAROUSEL */}
      <Slider
        ref={sliderRef}
        {...settings}
        className=" xs:h-[720px] h-[810px] md:h-auto "
      >
        {projects.map((project) => (
          <CarouselItem
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

      {/* CAROUSEL CHILD */}
      <motion.p
        animate={{
          opacity: 1,
          scale: 1,
        }}
        initial={{
          opacity: 0,
          scale: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 2.9,
        }}
        className="hidden md:flex text-textColor text-2xl ml-2"
      >
        Preview panel
      </motion.p>

      {/* THUMBNAIL CAROUSEL */}
      <div className="flex flex-col-reverse md:flex-row justify-center items-center gap-2 ">
        <Slider
          ref={thumbnailRef}
          {...thumbnailSettings}
          className="thumbnail-slider w-full md:w-[80%] flex justify-center items-center  "
        >
          {thumbnailData.map((thumbnail, index) => (
            <motion.div
              key={thumbnail.id}
              className="   flex items-center justify-center"
              animate={{
                opacity: 1,
                scale: 1,
              }}
              initial={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 2.9 + index * 0.1,
              }}
            >
              <Image
                src={thumbnail.url}
                width={400}
                height={400}
                alt={thumbnail.url}
                className="transition-opacity opacity-0 duration-[2s]"
                onLoadingComplete={(image) =>
                  image.classList.remove("opacity-0")
                }
              />
            </motion.div>
          ))}
        </Slider>
        <CarouselButton next={next} previous={previous} />
      </div>

      {/* MOBILE CAROUSEL */}
      <div>
        <motion.p
          animate={{
            opacity: 1,
            scale: 1,
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 3,
          }}
          className=" md:flex text-textColor text-2xl ml-2"
        >
          Mobile Projects
        </motion.p>
        <motion.p
          animate={{
            opacity: 1,
            scale: 1,
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 3.1,
          }}
          className=" md:flex text-textColor text-md ml-2"
        >
          Here are a few mobile projects I've been involved with.
        </motion.p>
      </div>
      <div>
        <Slider {...mobileSettings}>
          {mobileProjects.map((mobileImg, index) => (
            <motion.div
              key={mobileImg.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="flex rounded-xl overflow-hidden">
                <Image
                  src={mobileImg.url}
                  alt={mobileImg.url}
                  width={300}
                  height={300}
                  className="transition-opacity opacity-0 duration-[2s]"
                  onLoadingComplete={(image) =>
                    image.classList.remove("opacity-0")
                  }
                />
              </div>
            </motion.div>
          ))}
        </Slider>
      </div>

      {/* OTHER PROJECTS CAROUSEL */}
      <div>
        <motion.p
          animate={{
            opacity: 1,
            scale: 1,
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 3.2,
          }}
          className=" md:flex text-textColor text-2xl ml-2"
        >
          Other Projects
        </motion.p>
        <motion.p
          animate={{
            opacity: 1,
            scale: 1,
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 3.3,
          }}
          className=" md:flex text-textColor text-md ml-2"
        >
          Here are a few web projects I've been involved with.
        </motion.p>
      </div>

      <Slider {...workProjectsSettings}>
        {workProjects.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 * index }}
          >
            <div className="flex flex-col gap-2 items-center justify-center">
              <Image
                src={item.url}
                alt={item.url}
                width={800}
                height={800}
                className="transition-opacity opacity-0 duration-[2s]"
                onLoadingComplete={(image) =>
                  image.classList.remove("opacity-0")
                }
              />

              {item.link ? (
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" z-10  border-backgroundColor2 text-textColor hover:bg-textColor hover:text-backgroundColor2 border rounded-full  p-1 md:p-2 text-center w-[50%] text-xs md:text-md"
                >
                  Visit Project
                </Link>
              ) : (
                <div className="mt-2 text-center text-gray-500">
                  No link available
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
