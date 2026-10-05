"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";
import BeyondHorizon from "@/components/three/BeyondHorizon";
import MagneticButton from "@/components/ui/MagneticButton";

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reducedMotion;
}

export default function Hero() {
  const reducedMotion = useReducedMotionPreference();
  const sectionRef = useRef<HTMLElement | null>(null);
  const firstName = profile.name.split(" ")[0];
  const lastName = profile.name.split(" ").slice(1).join(" ");
  const stack = ["Java", "Spring Boot", "React", "Next.js", "MySQL", "MongoDB"];

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#08080A] pt-28 pb-16"
    >
      <BeyondHorizon
        reducedMotion={reducedMotion}
        brightness={3.2}
        coreSize={0.026}
        coreHover={0.058}
        haze={4}
        speed={0.26}
        parallax={1}
        fit={56}
        horizonY={0.705}
        interactionRef={sectionRef}
        className="z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[76%] z-[1] h-[22rem] w-[78vw] max-w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B79BFA]/16 blur-[96px] sm:h-[28rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[76.5%] z-[1] h-px w-[80vw] max-w-[980px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#B79BFA]/45 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[74.5%] z-[1] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[42px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(78%_54%_at_50%_70%,transparent_0%,rgba(8,8,10,0.08)_48%,rgba(8,8,10,0.68)_100%),linear-gradient(180deg,rgba(8,8,10,0.3)_0%,rgba(8,8,10,0.08)_48%,rgba(8,8,10,0.82)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 bg-gradient-to-r from-[#08080A]/92 via-[#08080A]/56 to-transparent"
      />

      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[max(2rem,calc((100vw-72rem)/2))] top-1/2 z-20 hidden w-[min(30vw,25rem)] -translate-y-1/2 lg:block"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/40">
          <Image
            src="/images/vishwa-portrait.png"
            alt={profile.name}
            fill
            sizes="400px"
            className="object-cover object-top grayscale contrast-110"
            priority
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 mix-blend-color bg-gradient-to-br from-accent via-accent-2/50 to-accent-3 opacity-[0.38]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-65"
          />
        </div>
      </motion.div>

      <div className="relative z-20 mx-auto flex min-h-[calc(100svh-11rem)] w-full max-w-6xl items-center px-6">
        <div
          className="min-w-0 w-full"
          style={{ maxWidth: "min(42rem, calc(100vw - 3rem))" }}
        >
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-foreground/78 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-2 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            {profile.location} &middot; Available for opportunities
          </motion.div>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-7 font-mono text-sm uppercase text-accent-2"
          >
            Software Engineer / Full-Stack Developer
          </motion.p>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16 }}
            className="mt-5 max-w-full break-words font-hero text-5xl font-semibold leading-[0.92] sm:text-7xl md:text-8xl lg:text-[6.6rem]"
          >
            <span className="block">{firstName}</span>
            <span className="block text-gradient drop-shadow-[0_0_58px_rgba(139,92,246,0.32)]">
              {lastName}
            </span>
          </motion.h1>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 w-full max-w-[19.5rem] text-base leading-relaxed text-foreground/72 sm:mt-7 sm:max-w-2xl sm:text-xl"
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 w-32 sm:w-48 lg:hidden"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.035] shadow-xl shadow-black/35">
              <Image
                src="/images/vishwa-portrait.png"
                alt={profile.name}
                fill
                sizes="224px"
                className="object-cover object-top grayscale contrast-110"
                priority
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 mix-blend-color bg-gradient-to-br from-accent via-accent-2/50 to-accent-3 opacity-[0.36]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"
              />
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10"
          >
            <MagneticButton href="#projects" className="bg-foreground text-background hover:bg-accent-2">
              View Projects <ArrowUpRight size={16} />
            </MagneticButton>
            <MagneticButton
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-white/12 bg-white/[0.045] text-foreground backdrop-blur-xl hover:border-accent-2/70"
            >
              Download CV <Download size={16} />
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="border border-transparent text-foreground/78 hover:text-white"
            >
              Contact Me <Mail size={16} />
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-10 flex flex-wrap gap-2 sm:mt-14"
          >
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-foreground/68"
              >
                {tech}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-8 flex items-center gap-5 text-foreground/58"
          >
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              data-cursor-hover
              aria-label="GitHub"
              className="transition-colors hover:text-white"
            >
              <FaGithub size={20} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor-hover
              aria-label="LinkedIn"
              className="transition-colors hover:text-white"
            >
              <FaLinkedin size={20} />
            </a>
            <span className="h-px w-14 bg-white/16" />
            <span className="text-sm text-foreground/54">{profile.roles[1]}</span>
          </motion.div>
        </div>

      </div>

      <motion.a
        href="#about"
        animate={reducedMotion ? { y: 0 } : { y: [0, 8, 0] }}
        transition={reducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-muted transition-colors hover:text-foreground"
        aria-label="Scroll to about section"
      >
        <ArrowDown size={22} />
      </motion.a>
    </section>
  );
}
