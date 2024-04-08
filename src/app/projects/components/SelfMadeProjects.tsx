import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AiFillStar } from "react-icons/ai";

interface SelfMadeProjectsProps {
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  ratings: number;
  techIcons: string[];
  projectUrl: string;
  previewUrl: string[];
}

const SelfMadeProjects = ({
  title,
  description,
  imageUrl,
  alt,
  ratings,
  techIcons,
  projectUrl,
  previewUrl,
}: SelfMadeProjectsProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const stars = Array.from({ length: 5 }).map((_, index) => (
    <AiFillStar
      key={index}
      className={`${index < ratings ? "filled" : "empty"}`}
      color={index < ratings ? "yellow" : "white"}
    />
  ));
  return (
    <div className=" font-tech  m-0  ">
      <div className="flex flex-col p-4  h-full justify-between ">
        <motion.div className="flex flex-col md:flex-row w-full  justify-between gap-2">
          {/* MAIN PICTURE SECTION */}
          <div
            className="relative w-full cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 2,
                delay: 2.6,
              }}
              className="relative w-full h-0 pb-[56.25%]"
            >
              <Image
                src={imageUrl}
                priority
                fill
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt={alt}
                className="transition-opacity duration-[2s]"
              />
            </motion.div>
            {isHovered && (
              <motion.div
                initial={{ y: "-100vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 2,
                  delay: 2.6,
                }}
                className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center"
              >
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-2xl font-bold py-2 px-4 rounded bg-opacity-70 hover:bg-opacity-80"
                >
                  VIEW SITE
                </a>
              </motion.div>
            )}
          </div>

          {/* PREVIEW IMAGES SECTION */}
          <div className="gap-2 grid grid-cols-3 md:grid-cols-2">
            {previewUrl.map((preview, index) => (
              <motion.div
                key={preview}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 3 + index * 0.1,
                }}
                className="w-full"
              >
                <Image
                  src={preview}
                  width={350} // Width is based on your preference
                  height={350} // Height should maintain aspect ratio
                  alt={preview}
                  className="transition-opacity duration-[2s] "
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* DESCRIPTION OF CURRENT SLIDE */}
        <motion.div
          className="text-white flex-col w-full  gap-4 justify-between  p-2  relative"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SelfMadeProjects;
