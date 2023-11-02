import Image from "next/image";
import Link from "next/link";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AiFillStar } from "react-icons/ai";
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
    <AiFillStar
      key={index}
      className={`${index < ratings ? "filled" : "empty"}`}
      color={index < ratings ? "yellow" : "white"}
    />
  ));

  return (
    <div className=" p-2 h-[35%] md:h-[700px] font-tech  m-0   ">
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
            <Image
              src={imageUrl}
              width={600}
              height={600}
              alt={alt}
              className="transition-opacity opacity-0 duration-[2s]"
              onLoadingComplete={(image) => image.classList.remove("opacity-0")}
            />
          </motion.div>
          {/* PREVIEW OF CURRENT SLIDE */}

          <Slider
            {...innerSettings}
            className=" preview-slider w-full   flex gap-2 relative  "
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
                  className="border-r-1 border-black transition-opacity opacity-0 duration-[2s]"
                  onLoadingComplete={(image) =>
                    image.classList.remove("opacity-0")
                  }
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
              className="text-2xl md:text-4xl text-cyan-500 "
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
              className="flex text-lg md:text-2xl"
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
              className="flex gap-4 bg-[#e91b1b23] rounded-lg md:p-2 mt-2"
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
                  <Image
                    src={techIcon}
                    alt={techIcon}
                    width={32}
                    height={32}
                    className="border-r-1 border-black transition-opacity opacity-0 duration-[2s]"
                    onLoadingComplete={(image) =>
                      image.classList.remove("opacity-0")
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="space-y-2 md:space-y-4  justify-between">
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
              className="text-xs md:text-2xl font-bold mx-auto text-center  cursor-pointer  w-[50%] justify-self-center z-20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 3.1,
              }}
              onClick={() => console.log("clicked")}
            >
              <Link href={projectUrl} target="_blank">
                <div className=" z-10 shadow-md shadow-[#ffd56cc3] border-backgroundColor2 text-textColor hover:bg-textColor hover:text-backgroundColor2 border rounded-full  pt-2 md:py-4 px-2">
                  View Site
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CarouselItem;
