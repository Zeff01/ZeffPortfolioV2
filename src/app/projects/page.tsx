"use client";

import React from "react";
import { motion } from "framer-motion";
import TransitionEffect from "@/hooks/TransitionEffect";
import {
  projects,
  workProjects,
  mobileProjects,
  groupProjects,
} from "@/data/projectsData";
import Image from "next/image";
import Link from "next/link";
import { getTechNameFromPath } from "@/utils/techIconMap";
import ProjectDescription from "@/components/ProjectDescription";

interface Project {
  id: string | number;
  title?: string;
  year?: number;
  role?: string;
  description?: string;
  fullDescription?: string;
  caseStudy?: {
    problem: string;
    approach: string;
    result: string;
    metrics?: { value: string; label: string }[];
  };
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


const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isMobile = false,
  isGroup = false,
  isWork = false,
}) => {

  const realLink = project.projectUrl || project.link || "";
  const hasLink = /^https?:\/\//.test(realLink);
  const imageUrl = project.imageUrl || project.url || "";
  const isSimpleCard = !project.title && !project.description;

  if (isSimpleCard) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className={`relative group rounded-xl overflow-hidden border border-white/5 shadow-lg shadow-black/30 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] ${
          isWork || isGroup
            ? "aspect-[21/13]"
            : isMobile
            ? "aspect-[3/4]"
            : "aspect-video"
        }`}
      >
        {hasLink ? (
          <Link
            href={realLink}
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
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="project thumbnail"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain transition-all duration-300 ${
                isMobile ? "object-center" : "object-contain"
              } group-hover:opacity-90 group-hover:scale-105`}
            />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative flex h-full flex-col bg-zinc-900/80 backdrop-blur border border-white/5 rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-black/40 hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.18)]"
    >
      <div className="relative aspect-[2/1] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={project.alt || "project image"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-all duration-300 group-hover:opacity-90 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mb-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {project.year && (
              <span className="inline-block px-3 py-1 text-sm font-bold bg-yellow-300 text-black rounded-full">
                {project.year}
              </span>
            )}
            {project.role && (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-zinc-700 text-gray-200 rounded-full">
                {project.role}
              </span>
            )}
          </div>
        </div>
        <ProjectDescription
          title={project.title}
          description={project.description}
          fullDescription={project.fullDescription}
          role={project.role}
          caseStudy={project.caseStudy}
        />

        {project.techIcons && (
          <div className="flex gap-2 mb-3 sm:mb-5 flex-wrap">
            {project.techIcons.map((tech, idx) => (
              <div
                key={idx}
                className="relative w-8 h-8 sm:w-10 sm:h-10 opacity-80 hover:opacity-100 transition-opacity"
                title={getTechNameFromPath(tech)}
              >
                <Image
                  src={tech}
                  alt={getTechNameFromPath(tech)}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        )}

        {hasLink ? (
          <Link
            href={realLink}
            target="_blank"
            className="mt-auto self-start inline-block px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
          >
            View Project
          </Link>
        ) : (
          <span
            title="Private / under NDA — source and live demo not publicly available"
            className="mt-auto inline-flex w-fit items-center gap-2 self-start rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-gray-300 sm:px-5 sm:py-2.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400"
              aria-hidden
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Private / NDA
          </span>
        )}
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
  const selfMadeProjects = Array.isArray(projects) 
    ? [...projects].sort((a, b) => (b.year || 0) - (a.year || 0))
    : [];
  const collaborativeProjs = Array.isArray(workProjects) 
    ? [...workProjects].sort((a, b) => (b.year || 0) - (a.year || 0))
    : [];
  const mobileProjs = Array.isArray(mobileProjects) ? mobileProjects : [];
  const groupProjs = Array.isArray(groupProjects) 
    ? [...groupProjects].sort((a, b) => (b.year || 0) - (a.year || 0))
    : [];

  return (
    <div className="relative min-h-screen bg-blackBackground text-white px-4 sm:px-8 md:px-12 py-16 sm:py-24 overflow-x-hidden">
      <TransitionEffect />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-buttonColor/15 blur-[130px]" />
        <div className="absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-textColor/10 blur-[130px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-24"
        >
          <span className="mb-4 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
            Portfolio
          </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {groupProjs.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isGroup={true}
                />
              ))}
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <p className="text-gray-300 mb-4">
                Want to see more of our work?
              </p>
              <Link
                href="https://www.codebility.tech/services"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
              >
                Visit Codebility - My Tech Company
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Projects;
