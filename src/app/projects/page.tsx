"use client";

import React from "react";
import { motion } from "framer-motion";
import TransitionEffect from "@/hooks/TransitionEffect";
import {
  projects,
  otherProjects,
  mobileProjects,
  groupProjects,
} from "@/data/projectsData";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface Project {
  id: string | number;
  title?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  link?: string;
  techIcons?: string[];
  projectUrl?: string;
  ratings?: number;
  alt?: string;
  otherUrl?: string[];
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isMobile?: boolean;
  isGroup?: boolean;
  isWork?: boolean;
}

interface SectionTitleProps {
  title: string;
  subTitle: string;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-1 mb-3 sm:mb-5">
    {[...Array(5)].map((_, idx) => (
      <Star
        key={idx}
        size={18}
        className={`${
          idx < rating
            ? "fill-yellow-300 text-yellow-300"
            : "fill-gray-600 text-gray-600"
        } sm:size-20`}
      />
    ))}
  </div>
);

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isMobile = false,
  isGroup = false,
  isWork = false,
}) => {
  const getTechName = (path: string) => {
    const filename = path.split("/").pop();
    return filename?.split(".")[0] || "";
  };

  const projectLink = project.projectUrl || project.link || project.url || "#";
  const imageUrl = project.imageUrl || project.url || "";
  const isSimpleCard = !project.title && !project.description;

  if (isSimpleCard) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className={`relative group rounded-xl overflow-hidden shadow-lg shadow-black/30 hover:shadow-yellow-500/30 ${
          isWork || isGroup
            ? "aspect-[21/13]"
            : isMobile
            ? "aspect-[3/4]"
            : "aspect-video"
        }`}
      >
        <Link
          href={projectLink}
          target="_blank"
          className="block w-full h-full"
        >
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="project thumbnail"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain transition-all duration-300 ${
                isMobile ? "object-center" : "object-contain"
              } group-hover:opacity-80 group-hover:scale-105`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <div className="text-white p-4 font-bold">View Project</div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative bg-zinc-900 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-black/40 hover:shadow-yellow-500/20"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={project.alt || "project image"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-all duration-300 group-hover:opacity-90 group-hover:scale-105"
        />
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {project.title}
        </h3>
        <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-3">
          {project.description}
        </p>

        {project.techIcons && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
            {project.techIcons.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 sm:px-3.5 py-1 text-xs bg-yellow-300/10 text-yellow-300 rounded-full capitalize font-medium"
              >
                {getTechName(tech)}
              </span>
            ))}
          </div>
        )}

        {project.ratings && <StarRating rating={project.ratings} />}

        <Link
          href={projectLink}
          target="_blank"
          className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
        >
          View Project
        </Link>
      </div>
    </motion.div>
  );
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subTitle }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="relative mb-8 sm:mb-14"
  >
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white inline-block">
        {title}
      </h2>
      <p className="text-gray-400 text-sm sm:text-base mt-1">{subTitle}</p>
      <motion.div
        className="absolute -bottom-2 left-0 h-1 bg-yellow-300"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
      />
    </div>
  </motion.div>
);

const Projects: React.FC = () => {
  const selfMadeProjects = Array.isArray(projects) ? projects : [];
  const collaborativeProjs = Array.isArray(otherProjects) ? otherProjects : [];
  const mobileProjs = Array.isArray(mobileProjects) ? mobileProjects : [];
  const groupProjs = Array.isArray(groupProjects) ? groupProjects : [];

  return (
    <div className="min-h-screen bg-blackBackground text-white px-4 sm:px-8 md:px-12 py-16 sm:py-24 overflow-x-hidden">
      <TransitionEffect />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-24"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 font-tech">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
              Projects
            </span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto">
            Explore my portfolio of projects spanning web development, mobile
            applications, and collaborative ventures.
          </p>
        </motion.div>

        {collaborativeProjs.length > 0 && (
          <section className="mb-20 sm:mb-36">
            <SectionTitle
              title="WORK PROJECTS"
              subTitle="Projects I've contributed to professionally."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {collaborativeProjs.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isWork={true}
                />
              ))}
            </div>
          </section>
        )}

        {selfMadeProjects.length > 0 && (
          <section className="mb-20 sm:mb-36">
            <SectionTitle
              title="SELF-MADE FUN PROJECTS"
              subTitle="Personal projects created for learning or experimentation."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {selfMadeProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </section>
        )}

        {mobileProjs.length > 0 && (
          <section className="mb-20 sm:mb-36">
            <SectionTitle
              title="MOBILE PROJECTS"
              subTitle="Projects designed specifically for mobile platforms."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {mobileProjs.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isMobile={true}
                />
              ))}
            </div>
          </section>
        )}

        {groupProjs.length > 0 && (
          <section>
            <SectionTitle
              title="GROUP PROJECTS"
              subTitle="Collaborative projects created with my community."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {groupProjs.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isGroup={true}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Projects;
