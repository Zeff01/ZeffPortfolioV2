import Link from "next/link";
import React, { useRef } from "react";
import { useScroll, motion } from "framer-motion";

interface LiAnimationProps {
  position: string;
  company: string;
  companyLink: string;
  time: string;
  address: string;
  work: string;
}

const LiAnimation = ({
  position,
  company,
  companyLink,
  time,
  address,
  work,
}: LiAnimationProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["center end", "center center"],
  });
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 3 }}
      className=" my-8 first:mt-0  w-[60%] mx-auto flex flex-col items-center justify-between "
    >
      <figure className="absolute left-0 stroke-white">
        <svg
          className="-rotate-90"
          width="75"
          height="75"
          viewBox="0 0 100 100"
        >
          <circle
            cx="75"
            cy="50"
            r="25"
            className="stroke-yellow-500 stroke-4 fill-none"
          />
          <motion.circle
            cx="75"
            cy="50"
            r="20"
            className="stroke-[5px] fill-[#0a0a0ae5]"
            style={{
              pathLength: scrollYProgress,
            }}
          />
          <circle
            cx="75"
            cy="50"
            r="10"
            className="animate-pulse stroke-1 fill-cyan-500"
          />
        </svg>
      </figure>
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <h3 className="capitalize font-bold text-md">
          {position} &nbsp;
          <Link
            href={companyLink}
            target="_blank"
            className="text-violet-500 capitalize"
          >
            @{company}
          </Link>
          <br />
          <span>
            {time} | {address}
          </span>
          <p className="font-light text-md text-gray-500 w-full">{work}</p>
        </h3>
      </motion.div>
    </motion.li>
  );
};

export default LiAnimation;
