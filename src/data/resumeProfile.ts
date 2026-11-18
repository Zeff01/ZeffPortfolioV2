/**
 * Résumé facts that don't live anywhere else in the portfolio data — taken
 * from the original CV (public/JzeffResume.pdf). Experience, projects, skills
 * and stats come from the rest of src/data, so the generated résumé updates
 * itself whenever those change. Edit this file for anything personal.
 */

export interface ResumeEducation {
  school: string;
  degree: string;
  period: string;
}

export interface ResumeProfile {
  fullName: string;
  /** Name as shown in the header. */
  displayName: string;
  headline: string;
  location: string;
  email: string;
  /** Leave empty to omit from the public résumé. */
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  education: ResumeEducation[];
  /** Tools on the original CV that aren't in the site's skill grid. */
  additionalSkills: string[];
  /** How many of the newest roles get a full description; older ones are condensed to one line. */
  detailedRoles: number;
  /** Work projects featured on the résumé. */
  featuredProjects: number;
}

export const resumeProfile: ResumeProfile = {
  fullName: "Jzeff Kendrew Somera",
  displayName: "Jzeff Kendrew Somera",
  headline: "AI Engineer · Full Stack & Blockchain Developer",
  location: "Pasig City, Philippines",
  email: "jzeffsomera@gmail.com",
  phone: "+639210900799",
  website: "https://zeff.tech",
  linkedin: "https://www.linkedin.com/in/jzeffsomera",
  github: "https://github.com/Zeff01",
  summary:
    "I am a dynamic and adaptable professional with extensive experience working across diverse cultures and environments. My versatility and collaborative approach allow me to thrive in any setting, consistently driving success for both teams and projects. As a dedicated leader, I founded Codebility, a thriving community of over 120 developers, fostering innovation, growth, and a strong sense of collaboration. With exceptional technical expertise, a passion for creative design, and a commitment to delivering efficient, user-friendly solutions, I excel in bridging the gap between innovation and usability to achieve organizational goals.",
  education: [
    {
      school: "University of Makati",
      degree: "Bachelor of Science in Information Technology and Service Management",
      period: "July 2017 – July 2021",
    },
  ],
  additionalSkills: [
    "Laravel",
    "MySQL",
    "SQL Server Management Studio",
    "GitLab",
    "Bitbucket",
    "NativeBase",
    "Ant Design",
  ],
  detailedRoles: 6,
  featuredProjects: 6,
};
