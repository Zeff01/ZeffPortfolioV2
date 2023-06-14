"use client";
import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CarouselItem from "./CarouselItem";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { projects } from "@/data/projectsData";

const Carousel = () => {
  const sliderRef = useRef<Slider>(null);
  const thumbnailRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    sliderRef.current?.slickGoTo(index);
    thumbnailRef.current?.slickGoTo(index);
  };

  const previous = () => {
    // const currentSlide = sliderRef.current?.innerSlider?.state?.currentSlide;
    if (currentSlide !== undefined) {
      goToSlide(currentSlide - 1);
    }
  };

  const next = () => {
    // const currentSlide = sliderRef.current?.innerSlider?.state?.currentSlide;
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
      console.log("current>>", current, "next>>", next);
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
      console.log("current", current);
      goToSlide(current);
    },
  };

  return (
    <div className="mx-1 md:mx-8 relative">
      <Slider ref={sliderRef} {...settings}>
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
      <Slider ref={thumbnailRef} {...thumbnailSettings}>
        <div className="border-2 border-red-500 bg-white">PROJECT 2</div>
        <div className="border-2 border-red-500 bg-white">PROJECT 3</div>
        <div className="border-2 border-red-500 bg-white">PROJECT 4</div>
        <div className="border-2 border-red-500 bg-white">PROJECT 5</div>
        <div className="border-2 border-red-500 bg-white">PROJECT 6</div>
        <div className="border-2 border-red-500 bg-white">PROJECT 1</div>
      </Slider>

      <div className="absolute bottom-10 left-4 flex gap-4">
        <button
          className="w-16 md:w-20 h-16 md:h-20 bg-black text-yellow-500 flex items-center justify-center rounded-md"
          onClick={previous}
        >
          <MdOutlineArrowBackIos className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        <button
          className="w-16 md:w-20 h-16 md:h-20 text-black bg-yellow-500 flex items-center justify-center rounded-md"
          onClick={next}
        >
          <MdOutlineArrowForwardIos className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
