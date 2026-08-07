"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skills, softSkills } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const ACCENTS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];

type Chip = { skill: string; category: string; accent: string };

export default function Skills() {
  const categories = useMemo(() => ["All", ...skills.map((g) => g.category)], []);
  const [active, setActive] = useState("All");

  const chips = useMemo<Chip[]>(
    () =>
      skills.flatMap((group, gi) =>
        group.skills.map((skill) => ({
          skill,
          category: group.category,
          accent: ACCENTS[gi % ACCENTS.length],
        }))
      ),
    []
  );

  const visible = active === "All" ? chips : chips.filter((c) => c.category === active);

  return (
    <section id="skills" className="relative py-28 sm:py-36 overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-8%] h-80 w-80 rounded-full bg-accent/10 blur-[100px]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[-8%] h-72 w-72 rounded-full bg-accent-2/10 blur-[100px]"
        animate={{ x: [0, -24, 0], y: [0, 18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          index="04"
          eyebrow="Skills"
          title="My technical toolkit."
          description="Languages, frameworks, and tools I use to take products from idea to production — tap a category to filter."
        />

        <Reveal delay={0.1} className="mt-12">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                data-cursor-hover
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active === cat ? "text-background" : "text-muted hover:text-foreground"
                }`}
              >
                {active === cat && (
                  <motion.span
                    layoutId="skills-tab-pill"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{cat}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout">
            {visible.map((chip) => (
              <motion.span
                key={chip.skill}
                layout
                initial={{ opacity: 0, scale: 0.6, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                whileHover={{ y: -3, scale: 1.05 }}
                className="group relative glass-panel rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/90 overflow-hidden"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-20"
                  style={{ background: chip.accent }}
                />
                <span className="relative flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: chip.accent }} />
                  {chip.skill}
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Reveal className="mt-20" delay={0.2}>
        <div className="group relative border-y border-border py-6 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...softSkills, ...softSkills].map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="font-display text-2xl sm:text-3xl text-muted/70 flex items-center gap-10"
              >
                {skill}
                <span className="text-accent-2">✦</span>
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
