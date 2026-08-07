"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import { MapPin, GraduationCap, Briefcase } from "lucide-react";
import { profile, stats, type Stat } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

const ACCENTS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];

const meta = [
  { icon: MapPin, label: profile.location },
  { icon: Briefcase, label: "Associate Software Engineer at ZData Innovations" },
  { icon: GraduationCap, label: "BSc (Hons) Software Engineering, Sabaragamuwa University of Sri Lanka" },
];

export default function About() {
  const paraRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: paraRef,
    offset: ["start 0.9", "start 0.35"],
  });
  const words = profile.summary.split(" ");

  return (
    <section id="about" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading index="01" eyebrow="About Me" title="Engineering software with intent." />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="group relative lg:col-span-3 glass-panel rounded-3xl p-8 sm:p-10 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 0.7, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl group-hover:opacity-100"
            />

            <p
              ref={paraRef}
              className="relative text-lg sm:text-xl leading-relaxed max-w-2xl"
            >
              {words.map((word, i) => (
                <RevealWord key={i} progress={scrollYProgress} index={i} total={words.length}>
                  {word}
                </RevealWord>
              ))}
            </p>

            <StaggerGroup className="relative mt-10 space-y-3" stagger={0.08}>
              {meta.map(({ icon: Icon, label }) => (
                <StaggerItem key={label}>
                  <div className="flex items-center gap-3 text-muted">
                    <motion.span
                      initial={{ scale: 0, rotate: -20 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background-elevated text-accent-2"
                    >
                      <Icon size={16} />
                    </motion.span>
                    <span>{label}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </motion.div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RevealWord({
  children,
  progress,
  index,
  total,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.25, 1]);
  const y = useTransform(progress, [start, end], [6, 0]);

  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.28em]">
      {children}
    </motion.span>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative glass-panel rounded-2xl p-6 h-full flex flex-col justify-between overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <span className="relative font-hero font-semibold text-3xl sm:text-4xl text-gradient">
        <AnimatedCount value={stat.value} />
      </span>
      <span className="relative mt-3 text-sm text-muted">{stat.label}</span>
    </motion.div>
  );
}

function AnimatedCount({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, count]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
