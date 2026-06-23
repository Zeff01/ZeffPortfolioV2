"use client";

import React, { useEffect, useRef, useState } from "react";
import ReadMore, { CaseStudy } from "./ReadMore";

interface ProjectDescriptionProps {
  title?: string;
  description?: string;
  fullDescription?: string;
  role?: string;
  caseStudy?: CaseStudy;
}

/**
 * Renders a project's description clamped to 3 lines, and shows a "Read more" /
 * "View case study" (opening a details modal) whenever the text is actually
 * truncated, a richer fullDescription exists, or a case study is provided.
 * Truncation is measured from the DOM so it works regardless of length.
 */
const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  title,
  description,
  fullDescription,
  role,
  caseStudy,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (el) setTruncated(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [description]);

  const showMore = !!caseStudy || !!fullDescription || truncated;

  return (
    <>
      <p
        ref={ref}
        className="mb-2 line-clamp-3 text-sm text-gray-300 sm:text-base"
      >
        {description}
      </p>
      {showMore && (
        <ReadMore
          title={title}
          role={role}
          caseStudy={caseStudy}
          text={fullDescription || description || ""}
        />
      )}
    </>
  );
};

export default ProjectDescription;
