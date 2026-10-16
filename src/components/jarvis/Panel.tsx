import React from "react";

interface PanelProps {
  title: string;
  /** Short status tag shown on the right of the header, e.g. "LIVE". */
  tag?: string;
  /** Extra header controls, rendered after the tag. */
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** HUD frame shared by every J.A.R.V.I.S. panel: clipped corners, accent brackets, header strip. */
export default function Panel({ title, tag, actions, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={`jv-panel flex flex-col ${className ?? ""}`}>
      <header className="flex items-center justify-between gap-2 border-b border-[color:var(--jv-line)] px-3 py-1.5 text-[10px] tracking-[0.25em] md:px-4 md:py-2.5 md:text-xs">
        <span className="jv-accent truncate">{title}</span>
        <div className="flex shrink-0 items-center gap-3">
          {tag && (
            <span className="jv-dim flex items-center gap-1.5">
              <span className="jv-blink inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--jv-accent)]" />
              {tag}
            </span>
          )}
          {actions}
        </div>
      </header>
      <div className={`flex-1 px-3 py-2 md:px-5 md:py-4 ${bodyClassName ?? ""}`}>{children}</div>
    </section>
  );
}
