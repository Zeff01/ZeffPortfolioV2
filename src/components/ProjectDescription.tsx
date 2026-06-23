"use client";

import React, { useEffect, useRef, useState } from "react";
import ReadMore from "./ReadMore";

interface ProjectDescriptionProps {
  title?: string;
  description?: string;
  fullDescription?: string;
}

/**
 * Renders a project's description clamped to 3 lines, and shows a "Read more"
 * (opening a details modal) whenever the text is actually truncated OR a
 * richer fullDescription is available. Truncation is measured from the DOM so
 * it works regardless of character count / wrapping.
 */
const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  title,
  description,
  fullDescription,
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

  const showMore = !!fullDescription || truncated;

  return (
    <>
      <p
        ref={ref}
        className="mb-2 line-clamp-3 text-sm text-gray-300 sm:text-base"
      >
        {description}
      </p>
      {showMore && (
        <ReadMore title={title} text={fullDescription || description || ""} />
      )}
    </>
  );
};

export default ProjectDescription;
