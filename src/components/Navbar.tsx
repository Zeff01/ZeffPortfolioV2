"use client";
import { motion, useCycle } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useDimensions } from "@/utils/useDimensions";
import { MenuToggle } from "./MenuToggle";

const Navbar = () => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  console.log("isOpen:", isOpen);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);

  const sidebar = {
    open: (height = 1000) => ({
      clipPath: `circle(${height * 2 + 200}px at 40px 40px)`,
      transition: {
        type: "spring",
        stiffness: 20,
        restDelta: 2,
      },
    }),
    closed: {
      clipPath: "circle(30px at 40px 40px)",
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const ulVariants = {
    open: {
      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const liVariants = {
    open: {
      y: 0,
      display: "flex",
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 50,
      display: "none",
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const pathname = usePathname();

  return (
    <nav>
      <div className="text-white gap-12 font-tech text-lg  md:flex pt-8 ml-40  m-2 hidden z-20 absolute items-center ">
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

        <Link href="/projects">
          <motion.span
            className={`text-textColor  hover:text-buttonColor ${
              pathname === "/projects" ? "box" : ""
            }`}
            variants={linkVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            PROJECTS
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
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            CONTACT
          </motion.span>
        </Link>
      </div>
      {/* HAMBURGER MENU*/}
      <div className="flex md:hidden z-90 bg-red-500 w-full ">
        <motion.nav
          initial={false}
          animate={isOpen ? "open" : "closed"}
          custom={height}
          ref={containerRef}
        >
          <motion.div className="background" variants={sidebar} />
          <motion.ul variants={ulVariants} className="ulToggle">
            <motion.li
              variants={liVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="liToggle hover-underline-animation"
            >
              <Link href="/" onClick={() => toggleOpen()}>
                Home
              </Link>
            </motion.li>
            <motion.li
              variants={liVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="liToggle hover-underline-animation"
            >
              <Link href="/about" onClick={() => toggleOpen()}>
                About
              </Link>
            </motion.li>

            <motion.li
              variants={liVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="liToggle hover-underline-animation"
            >
              <Link href="/projects" onClick={() => toggleOpen()}>
                Projects
              </Link>
            </motion.li>
            <motion.li
              variants={liVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="liToggle hover-underline-animation"
            >
              <Link href="/contact" onClick={() => toggleOpen()}>
                Contact Me
              </Link>
            </motion.li>
          </motion.ul>
          <MenuToggle toggle={() => toggleOpen()} />
        </motion.nav>
      </div>
    </nav>
  );
};

export default Navbar;
