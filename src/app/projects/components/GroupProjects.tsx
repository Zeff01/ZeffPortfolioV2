import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface GroupProjectItem {
  id: string;
  url: string;
  title: string;
  link?: string;
  otherUrl: string[];
}

interface GroupProjectsProps {
  item: GroupProjectItem;
  index: number;
  aspectRatio?: number;
}

const GroupProjects: React.FC<GroupProjectsProps> = ({
  item,
  index,
  aspectRatio = 16 / 9,
}) => {
  const [spotlightUrl, setSpotlightUrl] = useState(item.url);
  const [defaultUrl] = useState(item.url);

  // Increase the aspect ratio padding for a larger main image
  const aspectRatioPadding = (1 / aspectRatio) * 100 + "%";

  const handleImageClick = (url: string) => {
    setSpotlightUrl(url);
  };

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 2.9 + 0.2 * index }}
      className="w-full mx-auto flex flex-col gap-4 items-center justify-center p-6 rounded-lg" // Increased padding and gap for overall larger layout
    >
      <div className="text-3xl text-white">{item.title}</div>{" "}
      {/* Increased font size */}
      <div className="flex flex-col items-center">
        <div
          className="relative w-full max-w-4xl" // Set a maximum width for better control over size
          style={{ paddingTop: aspectRatioPadding }}
        >
          <Image
            src={spotlightUrl}
            layout="fill"
            priority
            alt={item.title || "Website title"}
            className="transition-opacity duration-[2s] object-cover" // Changed to object-cover for a fuller image
          />
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {" "}
          {/* Increased gap and margin */}
          {item.otherUrl.map((preview, previewIndex) => (
            <motion.div
              key={preview}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1,
                delay: 3 + (index + previewIndex) * 0.1,
              }}
              className="cursor-pointer"
              onClick={() => handleImageClick(preview)}
              style={{ width: "150px", height: "84px", position: "relative" }} // Explicitly define size to control preview images
            >
              <Image
                src={preview}
                layout="fill" // Changed to fill to ensure the defined size is used
                alt={preview}
                className="transition-opacity duration-[2s]"
              />
            </motion.div>
          ))}
        </div>
      </div>
      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block z-10 border-backgroundColor2 text-textColor hover:bg-textColor hover:text-backgroundColor2 border rounded-full p-2 md:p-3 text-center w-[60%] text-md font-bold" // Slightly increased size and padding
        >
          Visit Project
        </a>
      ) : (
        <div className="mt-3 text-center text-gray-500">No link available</div> // Increased margin
      )}
    </motion.div>
  );
};

export default GroupProjects;
