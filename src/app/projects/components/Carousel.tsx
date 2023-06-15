"use client";
import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CarouselItem from "./CarouselItem";

import { projects, thumbnailData } from "@/data/projectsData";
import Image from "next/image";
import CarouselButton from "./CarouselButton";

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
    <div className="mx-1 md:mx-8 relative flex flex-col">
      <div className=" ">
        <Slider ref={sliderRef} {...settings} className="carousel-slider">
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
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between items-center ">
        <Slider
          ref={thumbnailRef}
          {...thumbnailSettings}
          className="thumbnail-slider w-full md:w-[80%]  h-full flex justify-center items-center"
        >
          {thumbnailData.map((thumbnail) => (
            <div className="border-[8px] border-blackBackground ">
              <Image
                src={thumbnail.url}
                key={thumbnail.id}
                width={600}
                height={600}
                alt={thumbnail.url}
              />
            </div>
          ))}
        </Slider>
        <CarouselButton next={next} previous={previous} />
      </div>
    </div>
  );
};

export default Carousel;
