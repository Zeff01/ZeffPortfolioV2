import Image from "next/image";
import Link from "next/link";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GiMoebiusStar } from "react-icons/gi";
import { motion } from "framer-motion";

interface CarouselItemProps {
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  ratings: number;
  techIcons: string[];
  projectUrl: string;
  previewUrl: string[];
}

const innerSettings = {
  dots: false,
  dotsClass: "slick-dots slick-thumb",
  infinite: true,
  speed: 1500,
  slidesToShow: 3,
  slidesToScroll: 1,
  swipeToSlide: false,
  swipe: false,
  autoplay: true,
  autoplaySpeed: 2000,
  nextArrow: <></>,
  prevArrow: <></>,
};

const CarouselItem = ({
  title,
  description,
  imageUrl,
  alt,
  ratings,
  techIcons,
  projectUrl,
  previewUrl,
}: CarouselItemProps) => {
  const stars = Array.from({ length: 5 }).map((_, index) => (
    <GiMoebiusStar
      key={index}
      className={`${index < ratings ? "filled" : "empty"}`}
      color={index < ratings ? "yellow" : "white"}
    />
  ));

  return (
    <div className=" p-2 h-full md:h-[900px] font-tech ">
      <div className="flex flex-col md:flex-row p-2  h-full">
        <div className=" flex flex-col items-center gap-4  w-full md:w-[60%] justify-center ">
          {/* MAIN PIC OF CURRENT SLIDE */}
          <div className="flex flex-col justify-center  ">
            <Image src={imageUrl} width={800} height={800} alt={alt} />
          </div>
          {/* PREVIEW OF CURRENT SLIDE */}
          <Slider
            {...innerSettings}
            className=" w-full md:w-[70%] h-[200px] flex gap-2 relative "
          >
            {previewUrl.map((preview) => (
              <Image
                key={preview}
                src={preview}
                width={200}
                height={200}
                alt={preview}
                className="border-r-4 border-black"
              />
            ))}
          </Slider>
        </div>
        {/* DESCRIPTION OF CURRENT SLIDE */}
        <div className="text-white flex-col w-full md:w-[50%] space-y-4 md:space-y-12  p-2  relative">
          <div>
            <h1 className="text-4xl">{title}</h1>
            <p className="flex text-4xl">{stars}</p>
            <div className="flex gap-4 bg-[#e91b1b23] rounded-lg p-2 mt-2">
              {techIcons.map((techIcon) => (
                <motion.div
                  key={techIcon}
                  whileHover={{ scale: 1.3, opacity: 1 }}
                  className="flex flex-col justify-center items-center"
                >
                  <Image src={techIcon} alt={techIcon} width={40} height={40} />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <hr className=" border-backgroundColor2 shadow-xl shadow-yellow-500" />
            <p className="text-lg">{description}</p>

            <hr className=" border-backgroundColor2 shadow-xl shadow-yellow-500" />
            <motion.div
              className="text-2xl font-bold border rounded-full p-1 mx-auto text-center z-10  cursor-pointer  border-backgroundColor2 text-textColor hover:bg-textColor hover:text-backgroundColor2 w-[50%] justify-self-center"
              whileHover={{ scale: 1.1 }}
            >
              <Link href={projectUrl} target="_blank" className="w-[50%]">
                View Site
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselItem;
