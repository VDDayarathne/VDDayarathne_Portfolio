"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";

const ACCENTS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];

function ProjectCard({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isLast = index === total - 1;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], isLast ? [1, 1] : [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.85, 1], isLast ? [1, 1, 1] : [1, 1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], isLast ? [0, 0] : [0, 6]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div ref={ref} className={isLast ? "relative h-[70svh]" : "relative h-[130svh]"}>
      <div className="sticky top-24 sm:top-28">
        <motion.div
          style={{ scale, opacity, filter }}
          data-cursor-hover
          data-cursor-text="View"
          className="group relative w-full glass-panel rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 right-3 sm:right-6 font-hero font-semibold leading-none select-none text-[4rem] sm:text-[5.5rem] md:text-[7rem] opacity-[0.06]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-30"
            style={{ background: accent }}
          />

          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
            <div className="md:col-span-7">
              <p
                className="text-xs font-mono uppercase tracking-[0.3em]"
                style={{ color: accent }}
              >
                {project.tag} · {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </p>

              <h3 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{project.role}</p>

              <p className="mt-4 text-sm sm:text-base text-foreground/80 leading-relaxed max-w-xl">
                {project.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              {project.links && (
                <div className="mt-5 flex items-center gap-6 border-t border-border pt-5">
                  {project.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      data-cursor-hover
                      target={link.url !== "#" ? "_blank" : undefined}
                      rel={link.url !== "#" ? "noreferrer" : undefined}
                      aria-disabled={link.url === "#"}
                      className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-accent-2 transition-colors"
                    >
                      {link.label} <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-5 hidden md:block">
              <div className="relative aspect-[16/11] rounded-2xl border border-border overflow-hidden">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: `radial-gradient(120% 100% at 15% 0%, ${accent}, transparent 65%)`,
                  }}
                />
                <span
                  aria-hidden
                  className="absolute bottom-4 left-4 font-mono text-xs uppercase tracking-[0.25em] text-foreground/50"
                >
                  {project.tag}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          index="03"
          eyebrow="Selected Work"
          title="Things I've shipped."
          description="A mix of solo and collaborative builds — spanning backend architecture, full-stack products, and applied AI. Scroll to step through each one."
        />
      </div>

      <div className="mx-auto mt-16 max-w-5xl px-6">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={index}
            total={projects.length}
          />
        ))}
      </div>
    </section>
  );
}
