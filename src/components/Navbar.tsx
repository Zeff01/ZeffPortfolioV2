"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const pathname = usePathname();

  return (
    <nav className="text-white gap-12 font-tech text-[22px]  md:flex pt-8 ml-40  m-2 hidden z-20 absolute items-center">
      <Link href="/">
        <motion.span
          className={`text-textColor   hover:text-buttonColor ${
            pathname === "/" ? "box" : ""
          }`}
          variants={linkVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          HOME
        </motion.span>
      </Link>
      <Link href="/about">
        <motion.span
          className={`text-textColor  hover:text-buttonColor ${
            pathname === "/about" ? "box" : ""
          }`}
          variants={linkVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          ABOUT
        </motion.span>
      </Link>
      <Link href="/contact">
        <motion.span
          className={`text-textColor  hover:text-buttonColor ${
            pathname === "/contact" ? "box" : ""
          }`}
          variants={linkVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          CONTACT
        </motion.span>
      </Link>
      <Link href="/projects">
        <motion.span
          className={`text-textColor  hover:text-buttonColor ${
            pathname === "/projects" ? "box" : ""
          }`}
          variants={linkVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          PROJECTS
        </motion.span>
      </Link>
    </nav>
  );
};

export default Navbar;
