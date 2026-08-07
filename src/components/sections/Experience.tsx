"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";
import { experience, type Experience as ExperienceEntry } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 75%", "end 55%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  return (
    <section id="experience" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          index="02"
          eyebrow="Experience"
          title="Where I've built."
          description="Production experience across FinTech and banking domains — a step-by-step path of growing ownership and skill."
        />

        <div ref={trackRef} className="relative mt-16 pl-14">
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
          <motion.div
            style={{ scaleY: progress }}
            className="absolute left-[18px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-accent via-accent-2 to-accent-3"
          />

          <ol className="space-y-14 sm:space-y-16">
            {experience.map((job, i) => (
              <TimelineStep key={`${job.company}-${job.period}`} job={job} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineStep({ job, index }: { job: ExperienceEntry; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.1 }}
        className={`absolute -left-14 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-mono ${
          job.current
            ? "border-accent-2 bg-accent-2/15 text-accent-2"
            : "border-border bg-background-elevated text-muted"
        }`}
      >
        {job.current && (
          <span className="absolute inset-0 rounded-full bg-accent-2/40 animate-ping" />
        )}
        <span className="relative">{String(index + 1).padStart(2, "0")}</span>
      </motion.span>

      <div className="glass-panel rounded-2xl p-6 sm:p-7 transition-colors hover:border-accent-2/40">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-xl sm:text-2xl font-semibold">{job.role}</h3>
          {job.current && (
            <span className="rounded-full bg-accent-2/15 text-accent-2 text-xs font-medium px-3 py-1">
              Current
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Briefcase size={14} /> {job.company}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {job.location}
          </span>
          <span className="font-mono">{job.period}</span>
        </div>
        <ul className="mt-4 space-y-2.5">
          {job.bullets.map((bullet) => (
            <li
              key={bullet.slice(0, 40)}
              className="text-foreground/80 leading-relaxed pl-5 relative before:content-['▸'] before:absolute before:left-0 before:text-accent"
            >
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}
