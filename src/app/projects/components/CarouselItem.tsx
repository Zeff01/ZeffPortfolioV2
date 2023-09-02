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
    <div className=" p-2 h-[35%] md:h-[750px] font-tech  m-0  ">
      <div className="flex flex-col md:flex-row p-2  h-full  ">
        <motion.div className=" flex flex-col items-center gap-4  w-full md:w-[50%] pt-4 ">
          {/* MAIN PIC OF CURRENT SLIDE */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 2,
              delay: 2.6,
            }}
          >
            <Image src={imageUrl} width={800} height={800} alt={alt} />
          </motion.div>
          {/* PREVIEW OF CURRENT SLIDE */}

          <Slider
            {...innerSettings}
            className=" preview-slider w-full   flex gap-2 relative= "
          >
            {previewUrl.map((preview, index) => (
              <motion.div
                key={preview}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 3 + index * 0.1,
                }}
              >
                <Image
                  src={preview}
                  width={200}
                  height={200}
                  alt={preview}
                  className="border-r-1 border-black"
                  loading="eager"
                />
              </motion.div>
            ))}
          </Slider>
        </motion.div>
        {/* DESCRIPTION OF CURRENT SLIDE */}
        <motion.div
          className="text-white flex-col w-full md:w-[50%] gap-4 justify-between  p-2  relative "
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1,
            delay: 2.6,
          }}
        >
          <div className="   justify-between">
            <motion.h1
              className="text-4xl text-cyan-500 "
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 2.7,
              }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="flex text-4xl"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 2.8,
              }}
            >
              {stars}
            </motion.p>
            <motion.div
              className="flex gap-4 bg-[#e91b1b23] rounded-lg p-2 mt-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 2.9,
              }}
            >
              {techIcons.map((techIcon) => (
                <motion.div
                  key={techIcon}
                  whileHover={{ scale: 1.3, opacity: 1 }}
                  className="flex flex-col justify-center items-center cursor-pointer"
                >
                  <Image src={techIcon} alt={techIcon} width={40} height={40} />
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="space-y-4  justify-between">
            <hr className=" border-backgroundColor2 shadow-xl shadow-yellow-500" />
            <motion.p
              className="text-xs md:text-md lg:text-lg"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 3,
              }}
            >
              {description}
            </motion.p>

            <hr className=" border-backgroundColor2 shadow-xl shadow-yellow-500" />
            <motion.div
              className="text-2xl font-bold border rounded-full p-1 mx-auto text-center z-10  cursor-pointer  border-backgroundColor2 text-textColor hover:bg-textColor hover:text-backgroundColor2 w-[50%] justify-self-center shadow-md shadow-[#ffd56cc3]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 3.1,
              }}
            >
              <Link href={projectUrl} target="_blank" className="w-[50%] ">
                View Site
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CarouselItem;
