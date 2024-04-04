import Image from "next/image";
import { useState } from "react";

interface ThumbnailProps {
  thumbnail: {
    title: string;
    url: string;
    projectUrl: string;
  };
}
const Thumbnail = ({ thumbnail }: ThumbnailProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer m-4 md:m-0"
    >
      <Image
        src={thumbnail.url}
        width={800}
        height={800}
        alt={thumbnail.url}
        className="transition-opacity duration-[500ms]"
      />
      {isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center">
          <a
            href={thumbnail.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-white text-lg font-bold"
          >
            <span className="text-textColor">{thumbnail.title}</span>
            <span>View Site</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default Thumbnail;
