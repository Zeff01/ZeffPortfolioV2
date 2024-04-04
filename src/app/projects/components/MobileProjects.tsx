import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
type MobileProjectsProps = {
  mobileImg: {
    id: string | number;
    url: string;
  };
  index: number;
};

const MobileProjects = ({ mobileImg, index }: MobileProjectsProps) => {
  // Added state to track image loading
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <motion.div
      key={mobileImg.id}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="w-full max-w-xl mx-auto flex flex-col gap-2 items-center justify-center p-4 rounded-lg"
    >
      <div
        className={`relative w-full h-auto overflow-hidden rounded-lg ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-2000 ease-linear`}
      >
        <Image
          src={mobileImg.url}
          alt="Mobile Project Image"
          layout="responsive"
          width={300} // Adjust based on your actual image aspect ratio
          height={300}
          onLoadingComplete={() => setIsLoading(false)} // Update state when image loads
          className="w-full h-auto object-contain" // Use 'object-cover' if you want to cover the area
        />
      </div>
    </motion.div>
  );
};

export default MobileProjects;
