import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface CollaborativeProjectItem {
  id: string;
  url: string;
  title?: string;
  link?: string;
}

interface CollaborativeProjectsProps {
  item: CollaborativeProjectItem;
  index: number;
}

const CollaborativeProjects: React.FC<CollaborativeProjectsProps> = ({
  item,
  index,
}) => {
  const paddingBottom = (1 / (16 / 9)) * 100; // For 16:9 aspect ratio

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 2.9 + 0.2 * index }}
      className="w-full max-w-4xl mx-auto flex flex-col gap-2 items-center justify-center p-4 rounded-lg"
    >
      <div
        className="relative w-full"
        style={{ paddingBottom: `${paddingBottom}%` }}
      >
        {/* Using a wrapper to control aspect ratio via padding-bottom */}
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <Image
            src={item.url}
            alt={item.title || "Default alt text"}
            priority
            fill
            objectFit="contain"
            className="transition-opacity duration-[2s]"
          />
        </div>
      </div>

      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block z-10 border-backgroundColor2 text-textColor hover:bg-textColor hover:text-backgroundColor2 border rounded-full p-1 md:p-2 text-center w-[50%] text-xs md:text-sm"
        >
          Visit Project
        </a>
      ) : (
        <div className="mt-2 text-center text-gray-500">No link available</div>
      )}
    </motion.div>
  );
};

export default CollaborativeProjects;
