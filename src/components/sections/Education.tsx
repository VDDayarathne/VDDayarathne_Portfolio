"use client";

import { motion } from "framer-motion";
import { GraduationCap, Users, Sparkles, type LucideIcon } from "lucide-react";
import { education, leadership, extracurricular, type Education as EducationEntry, type Leadership } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal, { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

const ACCENTS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];

export default function Education() {
  return (
    <section id="education" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          index="05"
          eyebrow="Education & Leadership"
          title="Where I've grown."
          description="Academic foundation paired with leadership roles that sharpened how I collaborate and deliver under pressure."
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <SubHeading icon={GraduationCap} label="Education" />
            <div className="mt-6 space-y-5">
              {education.map((edu, i) => (
                <EduCard key={edu.school} edu={edu} index={i} />
              ))}
            </div>

            <SubHeading icon={Sparkles} label="Extracurricular" className="mt-12" />
            <StaggerGroup className="mt-6 space-y-3" stagger={0.1}>
              {extracurricular.map((item) => (
                <StaggerItem key={item.slice(0, 30)}>
                  <div className="group flex items-start gap-3 rounded-xl px-3 py-2 -mx-3 transition-colors hover:bg-glass">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2 transition-transform group-hover:scale-125" />
                    <p className="text-foreground/80 leading-relaxed">{item}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          <div>
            <SubHeading icon={Users} label="Leadership & Volunteering" />
            <div className="mt-6 space-y-5">
              {leadership.map((role, i) => (
                <LeadershipCard key={role.title} role={role} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubHeading({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <h3 className="flex items-center gap-3 font-display text-xl font-semibold">
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background-elevated text-accent-2"
        >
          <Icon size={16} />
        </motion.span>
        {label}
      </h3>
    </Reveal>
  );
}

function EduCard({ edu, index }: { edu: EducationEntry; index: number }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative glass-panel rounded-2xl p-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 0.15, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, delay: index * 0.08 + 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full blur-3xl group-hover:opacity-30"
        style={{ background: accent }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-lg">{edu.school}</h4>
        <span className="font-mono text-xs" style={{ color: accent }}>
          {edu.period}
        </span>
      </div>
      <p className="relative mt-1 text-foreground/80">{edu.program}</p>
      <p className="relative mt-1 text-sm text-muted">{edu.location}</p>
      {edu.details && (
        <ul className="relative mt-3 flex flex-wrap gap-2">
          {edu.details.map((detail) => (
            <li
              key={detail}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted"
            >
              {detail}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function LeadershipCard({ role, index }: { role: Leadership; index: number }) {
  const accent = ACCENTS[(index + 1) % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative glass-panel rounded-2xl p-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 0.15, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, delay: index * 0.08 + 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full blur-3xl group-hover:opacity-30"
        style={{ background: accent }}
      />

      <h4 className="relative font-semibold text-lg">{role.title}</h4>
      <p className="relative mt-1 text-sm" style={{ color: accent }}>
        {role.org}
      </p>
      <ul className="relative mt-4 space-y-2.5">
        {role.bullets.map((bullet) => (
          <li
            key={bullet.slice(0, 40)}
            className="text-sm text-foreground/80 leading-relaxed pl-5 relative before:content-['▸'] before:absolute before:left-0 before:text-accent"
          >
            {bullet}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
